const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);

// Functions to display user's choices
const viewAllDepartments = () => {
  const sql = `SELECT * FROM department`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.table(rows);
      init();
    }
  });
};

const viewAllRoles = () => {
  const sql = `SELECT roles.id AS id, roles.title AS title, department.name AS department, roles.salary AS salary
  FROM roles
  JOIN department ON roles.department_id = department.id;`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.table(rows);
      init();
    }
  });
};

const viewAllEmployees = () => {
  const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, roles.title AS job_title, department.name AS department, roles.salary AS salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager
  FROM employee
  JOIN roles ON employee.role_id = roles.id
  JOIN department ON roles.department_id = department.id
  LEFT JOIN employee manager on employee.manager_id = manager.id
  ORDER BY id ASC;`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.table(rows);
      init();
    }
  });
};

const addDepartment = async () => {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "What is the name of the department?",
    },
  ]);
  const sql = `INSERT INTO department(name) VALUES (?)`;
  db.query(sql, answer.departmentName, (err, res) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Added the department successfully");
      init();
    }
  });
};

const addRole = async () => {
  updateDepartmentArr();
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "roleName",
      message: "What is the name of the role?",
    },
    {
      type: "input",
      name: "roleSalary",
      message: "What is the salary of the role?",
    },
    {
      type: "list",
      name: "roleDepartment",
      message: "Which department does the role belong to?",
      choices: departmentArr,
    },
  ]);
  const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?)`;
  db.query(
    sql,
    [[answers.roleName, answers.roleSalary, answers.roleDepartment]],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Added the role successfully");
        init();
      }
    }
  );
};

// Empty array to be populated with the different departments, to then be used as the choices for the list inquirer prompt
let departmentArr = [];

// A function to update the department array, called when the user wants to add a new role.
const updateDepartmentArr = () => {
  departmentArr = [];
  const sql = `SELECT * FROM department`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, res) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        res.forEach((department) => {
          let departmentObj = {
            name: department.name,
            value: department.id,
          };
          departmentArr.push(departmentObj);
        });
        resolve();
      }
    });
  });
};

const addEmployee = async () => {
  await updateRolesArr();
  await updateEmployeeArr();

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "employeeFirstName",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "employeeLastName",
      message: "What is the employee's last name?",
    },
    {
      type: "list",
      name: "employeeRole",
      message: "What is the employee's role?",
      choices: rolesArr,
    },
    {
      type: "list",
      name: "employeeManager",
      message: "Who is the employee's manager?",
      choices: employeeArr,
    },
  ]);
  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`;
  db.query(
    sql,
    [
      [
        answers.employeeFirstName,
        answers.employeeLastName,
        answers.employeeRole,
        answers.employeeManager,
      ],
    ],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Added the employee successfully");
        init();
      }
    }
  );
};

// Empty array to be populated with the different roles, to then be used as the choices for the list inquirer prompt
let rolesArr = [];

const updateRolesArr = () => {
  rolesArr = [];
  const sql = `SELECT * FROM roles`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, res) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        res.forEach((role) => {
          let roleObj = {
            name: role.title,
            value: role.id,
          };
          rolesArr.push(roleObj);
        });
        resolve();
      }
    });
  });
};

// Empty array to be populated with the different employees, to then be used as the choices for the list inquirer prompt
let employeeArr = [];

const updateEmployeeArr = () => {
  employeeArr = [];
  const sql = `SELECT * FROM employee`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, res) => {
      if (err) {
        console.log(err);
        reject();
      } else {
        res.forEach((employee) => {
          let employeeObj = {
            name: employee.first_name + " " + employee.last_name,
            value: employee.id,
          };
          employeeArr.push(employeeObj);
        });
        resolve();
      }
    });
  });
};

const updateEmployeeRole = async () => {
  await updateRolesArr();
  await updateEmployeeArr();
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "employeeSelect",
      message: "Which employee's role do you want to update?",
      choices: employeeArr,
    },
    {
      type: "list",
      name: "roleSelect",
      message: "Which role do you want to assign the selected employee?",
      choices: rolesArr,
    },
  ]);
  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  db.query(
    sql,
    [[answers.roleSelect], [answers.employeeSelect]],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated the employee's role successfully");
        init();
      }
    }
  );
};

// Hash to be used for the user choices and references to the functions
const userChoiceHash = {
  "View all departments": viewAllDepartments,
  "View all roles": viewAllRoles,
  "View all employees": viewAllEmployees,
  "Add a department": addDepartment,
  "Add a role": addRole,
  "Add an employee": addEmployee,
  "Update an employee role": updateEmployeeRole,
  "Nothing, I am finished.": process.exit,
};

// Inquirer prompt for the user to choose what they would like to display
const init = async () => {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: Object.keys(userChoiceHash),
    },
  ]);
  const fn = userChoiceHash[answer.choice];
  await fn();
};

// Function call to initialise the app
init();
