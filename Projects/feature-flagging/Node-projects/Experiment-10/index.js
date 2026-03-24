const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const employees = [];
function showMenu() {
  console.log('\nEmployee Management System');
  console.log('1. Add Employee');
  console.log('2. List Employees');
  console.log('3. Remove Employee');
  console.log('4. Exit');
  rl.question('Choose an option: ', handleMenu);
}
function handleMenu(choice) {
  switch (choice.trim()) {
    case '1':
      addEmployee();
      break;
    case '2':
      listEmployees();
      break;
    case '3':
      removeEmployee();
      break;
    case '4':
      console.log('Exiting...');
      rl.close();
      break;
    default:
      console.log('Invalid option. Try again.');
      showMenu();
  }
}
function addEmployee() {
  rl.question('Enter employee name: ', (name) => {
    rl.question('Enter employee ID: ', (id) => {
      // Check if ID already exists
      if (employees.find(emp => emp.id === id)) {
        console.log('Employee ID already exists. Try again.');
        showMenu();
      } else {
        employees.push({ name, id });
        console.log(`Employee ${name} added.`);
        showMenu();
      }
    });
  });
}
function listEmployees() {
  if (employees.length === 0) {
    console.log('No employees found.');
  } else {
    console.log('\nEmployee List:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. Name: ${emp.name}, ID: ${emp.id}`);
    });
  }
  showMenu();
}
function removeEmployee() {
  rl.question('Enter employee ID to remove: ', (id) => {
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      console.log('Employee not found.');
    } else {
      const removed = employees.splice(index, 1)[0];
      console.log(`Employee ${removed.name} removed.`);
    }
    showMenu();
  });
}
showMenu();
