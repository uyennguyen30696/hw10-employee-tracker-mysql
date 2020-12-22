const mysql = require("mysql");
const inquirer = require("inquirer");
require('console.table');

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "Uyen3061",
    database: "employee_trackerDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    init();
});

const init = async () => {
    await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Hello! What\'s your name?'
        }
    ]).then(resp => {
        console.log("Hello " + `${resp.name}` + "!");
    });

    promptAction();
};

async function promptAction() {
    await inquirer.prompt(
        {
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View all employees by department',
                'View all employees by role',
                'View all employees by manager',
                'Add employee',
                'Remove employee',
                'Update employee',
                'Update roles',
                'Update departments',
                'Quit'
            ]
        }).then(resAction => {
            switch (resAction.action) {
                case 'View all employees':
                    viewAllEmployees();
                    break;

                case 'View all employees by department':
                    viewByDepartment();
                    break;

                case 'View all employees by role':
                    viewByRole();
                    break;

                case 'View all employees by manager':
                    viewByManager();
                    break;

                case 'Add employee':
                    addEmployee();
                    break;

                case 'Remove employee':
                    removeEmployee();
                    break;

                case 'Update employee':
                    updateEmployee();
                    break;

                case 'Quit':
                    connection.end();
                    break;
            }
        });
};

function viewAllEmployees() {
    let query = `SELECT employees.id AS employees_ID, employees.first_name, employees.last_name, roles.title, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name, manager.id AS manager_ID, department.department_name AS department
    FROM employees
    INNER JOIN roles ON employees.role_id = roles.id
    INNER JOIN department ON roles.department_id = department.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id
    ORDER BY employees.id;`;
    connection.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        promptAction();
    });
};

function viewByDepartment() {
    let query = `SELECT department.id AS department_ID, department.department_name AS department, employees.id AS employee_ID , employees.first_name, employees.last_name, roles.title
    FROM employees
    INNER JOIN roles ON employees.role_id = roles.id
    INNER JOIN department ON roles.department_id = department.id
    ORDER BY department.id;`;
    connection.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);

        // connection.query(`SELECT `)
        // inquirer.prompt(
        //     {
        //         name: 'department_filter',
        //         type: 'list',
        //         message: 'Filter by?',
        //         choices: () => results.map(results => results.department)
        //     }
        // ).then(resFilterDepartment => {
        //     console.table(resFilterDepartment.department_filter);
        // });

        promptAction();
    });
};

function viewByRole() {
    let query = `SELECT roles.id AS role_ID, roles.title, employees.id AS employee_ID, employees.first_name, employees.last_name
    FROM employees
    INNER JOIN roles ON employees.role_id = roles.id
    ORDER BY roles.id;`;
    connection.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        promptAction();
    });
};

function viewByManager() {
    let query = `SELECT manager.id AS manager_ID, CONCAT(manager.first_name, manager.last_name) AS manager_name, employees.id AS employee_ID, employees.first_name, employees.last_name, roles.title
    FROM employees
    RIGHT JOIN employees manager ON employees.manager_id = manager.id
    INNER JOIN roles ON employees.role_id = roles.id
    ORDER BY employees.id;`;
    connection.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        promptAction();
    });
};

const promptName = () => {
    return inquirer.prompt([
        {
            name: 'add_first_name',
            type: 'input',
            message: 'What is the employee\'s first name?'
        },
        {
            name: 'add_last_name',
            type: 'input',
            message: 'What is the employee\'s last name?'
        }
    ]);
};

async function addEmployee() {
    const askName = await promptName();

    // let queryDepartment = `SELECT * 
    //     FROM department;`;
    let queryRole = `SELECT id, title
        FROM roles
        ORDER BY roles.id;`;
    let queryManager = `SELECT id, first_name, last_name
        FROM employees;`;
    // connection.query(queryDepartment, function (err, departmentResults) {
    //     if (err) throw err;

    // let departmentArr = [];
    // departmentResults.forEach(element => {
    //     departmentArr.push(JSON.stringify(element))
    // });
    // let addDepartment = departmentResults.map(({ id, department_name }) =>
    // ({
    //     id: id,
    //     name: `${id} ${department_name}`
    // })
    // );

    connection.query(queryRole, function (err, roleResults) {
        if (err) throw err;

        // let roleArr = [];
        // roleResults.forEach(element => {
        //     roleArr.push(JSON.stringify(element))
        // });
        let addRole = roleResults.map(({ id, title }) =>
        ({
            id: id,
            name: `${id} ${title}`
        })
        );

        connection.query(queryManager, function (err, managerResults) {
            if (err) throw err;

            // let managerArr = [];
            // // managerResults.forEach(element => {
            // //     managerArr.push(JSON.stringify(element))
            // // });
            // function managerChoices() {
            //     for (var i = 0; i < managerResults.length; i++) {
            //         managerArr.push(managerResults[i].first_name + ' ' + managerResults[i].last_name);
            //         // managerArr.push('N/A')
            //     }
            //     // return managerArr;
            // }
            // managerChoices();
            let addManager = managerResults.map(({ id, first_name, last_name }) =>
            ({
                id: id,
                name: `${id} ${first_name} ${last_name}`
            })
            );

            inquirer.prompt([
                // {
                //     name: 'add_department',
                //     type: 'list',
                //     message: 'Choose a department:',
                //     // choices: () => departmentResults.map(departmentResults => departmentResults.department_name)
                //     // choices: departmentArr
                //     choices: addDepartment
                // },
                {
                    name: 'add_role',
                    type: 'list',
                    message: 'What is the employee\'s role?',
                    // choices: () => roleResults.map(roleResults => roleResults.title)
                    // choices: roleArr
                    choices: addRole
                },
                {
                    name: 'add_manager',
                    type: 'list',
                    message: 'Who is the employee\'s manager?',
                    // choices: managerArr
                    choices: addManager
                }
            ]).then(resAdd => {
                connection.query('INSERT INTO employees SET ?',
                    {
                        first_name: askName.add_first_name,
                        last_name: askName.add_last_name,
                        role_id: parseInt(resAdd.add_role),
                        manager_id: parseInt(resAdd.add_manager)
                    },
                    function (err) {
                        if (err) throw err;
                    }
                )
                console.log('The new employee has been added. Please view the list of all employees again to verify.');
                viewAllEmployees();
            })
        });
    });
    // });
};

function removeEmployee() {
    const queryEmployee = `SELECT * FROM employees;`;
    const queryRemove = `DELETE FROM employees WHERE ?`;
    connection.query(queryEmployee, function (err, employeeResults) {
        if (err) throw err;

        let removeEmployee = employeeResults.map(({ id, first_name, last_name }) =>
        ({
            id: id,
            name: `${id} ${first_name} ${last_name}`
        })
        );
        inquirer.prompt(
            {
                name: 'remove_employee',
                type: 'list',
                message: 'Choose the employee you would like to remove.',
                choices: removeEmployee
            }
        ).then(resRemove => {
            connection.query(queryRemove, { id: parseInt(resRemove.remove_employee) }, function (err) {
                if (err) throw err;

                console.log('The chosen employee has been deleted. Please view the list of all employees again to verify.');
                viewAllEmployees();
            });
        });
    });
};

function updateEmployee() {
    const queryEmployee = `SELECT * FROM employees;`;
    const queryRole = `SELECT * FROM roles;`;
    connection.query(queryEmployee, function (err, updateResults) {
        if (err) throw err;

        let updateEmployee = updateResults.map(({ id, first_name, last_name }) =>
        ({
            id: id,
            name: `${id} ${first_name} ${last_name}`
        })
        );
        inquirer.prompt([
            {
                name: 'update_employee',
                type: 'list',
                message: 'Choose the employee you would like to update.',
                choices: updateEmployee
            },
            {
                name: 'update_list',
                type: 'list',
                message: 'Choose the employee\'s information to update:',
                choices: [
                    'Role',
                    'Salary',
                    'Manager'
                ]
            }
        ]).then(resUpdate => {

            if (resUpdate.update_list === 'Role') {
                connection.query(queryRole, function (err, results) {
                    if (err) throw err;

                    let updateRole = results.map(({ id, title }) =>
                    ({
                        id: id,
                        name: `${id} ${title}`
                    })
                    );

                    inquirer.prompt(
                        {
                            name: 'update_role',
                            type: 'list',
                            message: 'What is the employee\'s new role?',
                            choices: updateRole
                        }
                    ).then(resRole => {
                        connection.query("UPDATE employees SET ? WHERE ?",
                            [
                                {
                                    role_id: parseInt(resRole.update_role)
                                },
                                {
                                    id: parseInt(resUpdate.update_employee)
                                }
                            ],
                            function (err) {
                                if (err) throw err;
                            });

                        console.log('The chosen employee\'s information has been updated. Please view the list of all employees again to verify.');
                        viewAllEmployees();
                    });
                });
            }

            else if (resUpdate.update_list === 'Salary') {
                connection.query(queryRole, function (err, results) {
                    if (err) throw err;

                    let updateSalary = results.map(({ id, salary }) =>
                    ({
                        id: id,
                        name: `${id} ${salary}`
                    })
                    );

                    inquirer.prompt(
                        {
                            name: 'update_salary',
                            type: 'list',
                            message: 'What is the employee\'s new salary?',
                            choices: updateSalary
                        }
                    ).then(resSalary => {
                        connection.query("UPDATE employees SET ? WHERE ?",
                            [
                                {
                                    role_id: parseInt(resSalary.update_salary)
                                },
                                {
                                    id: parseInt(resUpdate.update_employee)
                                }
                            ],
                            function (err) {
                                if (err) throw err;
                            });

                        console.log('The chosen employee\'s information has been updated. Please view the list of all employees again to verify.');
                        viewAllEmployees();
                    });
                });
            }
            else if (resUpdate.update_list === 'Manager') {
                connection.query(queryEmployee, function (err, results) {
                    if (err) throw err;

                    let updateManager = results.map(({ id, first_name, last_name }) =>
                    ({
                        id: id,
                        name: `${id} ${first_name} ${last_name}`
                    })
                    );

                    inquirer.prompt(
                        {
                            name: 'update_manager',
                            type: 'list',
                            message: 'Who is the employee\'s new manager?',
                            choices: updateManager
                        }
                    ).then(resManager => {
                        connection.query("UPDATE employees SET ? WHERE ?",
                            [
                                {
                                    manager_ID: parseInt(resManager.update_manager)
                                },
                                {
                                    id: parseInt(resUpdate.update_employee)
                                }
                            ],
                            function (err) {
                                if (err) throw err;
                            });

                        console.log('The chosen employee\'s information has been updated. Please view the list of all employees again to verify.');
                        viewAllEmployees();
                    });
                });
            };
        });
    });
};
