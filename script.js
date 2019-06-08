var db = null;
// if .onsuccess -> hold IndexedDB for this domain


function createDatabase() {

    if (!window.indexedDB) {
        window.alert("Your browser doesn't support IndexedDB.");
    }

    // employee data
    var employeeData = [
        { employeeId: 1, name: "Daniel", email: "daniel@company.com" },
        { employeeId: 2, name: "Berta", email: "berta@company.com" }
    ];

    var dbName = "EmployeeDB";

    // Open database with version=1. Use integer valueonly ! Not 1.1, 1.2 etc.
    var request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("request.onerror errcode=" + event.target.error.name);
    };

    request.onupgradeneeded = function (event) {
        console.log("request.onupgradeneeded, creating a new version of the database");
        db = event.target.result;

        // Create an objectStore for employees. use unique employeeId as key path
        var objectStore = db.createObjectStore("employees", { keyPath: "employeeId" });

        // Create index to search employee by name.
        objectStore.createIndex("name", "name", { unique: false });

        // Create an index to search by email.
        objectStore.createIndex("email", "email", { unique: true });

        // Store values in objectStore.
        for (var i in employeeData) {
            objectStore.add(employeeData[i]);
        }
    };

    request.onsuccess = function (event) {
        // Handle errors.
        console.log("request.onsuccess, database opened, now can add / remove / look for data in IndexedDB.");

        // The result is the database itself
        db = event.target.result;
    };
}

function addEmployee() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create EmployeeDB Database\' first');
        return;
    }

    // 1. open trx 
    var transaction = db.transaction(["employees"], "readwrite");

    transaction.oncomplete = function (event) {
        console.log("DONE: data was added to IndexedDB");
    };

    transaction.onerror = function (event) {
        console.log("ERROR: transaction.onerror" + event.target.errorCode);
    };

    var objectStore = transaction.objectStore("employees");

    var newEmployee = {};
    newEmployee.employeeId = parseInt(document.querySelector("#employeeId").value);
    newEmployee.name = document.querySelector("#name").value;
    newEmployee.email = document.querySelector("#email").value;
    alert('adding employee ID =' + newEmployee.employeeId);
    var request = objectStore.add(newEmployee);

    request.onsuccess = function (event) {
        console.log("Employee with employee ID = " + event.target.result + " added.");
    };
    request.onerror = function (event) {
        alert("request.onerror, could not insert employee, errcode = " + event.target.errorCode + ". Either the employee ID or the email is already in Database");
    };

}

function removeEmployee() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create EmployeeDB Database\' first');
        return;
    }

    var transaction = db.transaction(["employees"], "readwrite");

    transaction.oncomplete = function (event) {
        console.log("DONE: employee removed.");
    };

    transaction.onerror = function (event) {
        console.log("ERROR: transaction.onerror" + event.target.errorCode);
    };

    var objectStore = transaction.objectStore("employees");


    alert('removing employee ID = 1');
    var request = objectStore.delete(1);

    request.onsuccess = function (event) {
        console.log("Employee removed.");
    };

    request.onerror = function (event) {
        alert("request.onerror, could not remove employee, errcode = " + event.target.error.name + ". The employee ID does not exist in Database");
    };

}

function updateEmployee() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create CustomerDB Database\' first');
        return;
    }

    var transaction = db.transaction(["employees"], "readwrite");

    transaction.oncomplete = function (event) {
        console.log("DONE: employee updated.");
    };

    transaction.onerror = function (event) {
        console.log("transaction.onerror errcode=" + event.target.error.name);
    };

    var objectStore = transaction.objectStore("employees");

    var employeeToUpdate = {};
    employeeToUpdate.employeeId = parseInt(document.querySelector("#employeeId").value);
    employeeToUpdate.name = document.querySelector("#name").value;
    employeeToUpdate.email = document.querySelector("#email").value;
    alert('UPDATING employee ID=' + employeeToUpdate.employeeId);

    var request = objectStore.put(employeeToUpdate);

    request.onsuccess = function (event) {
        console.log("Employee updated.");
    };
    request.onerror = function (event) {
        alert("request.onerror, could not update employee, errcode = " + event.target.error.name + ". The employee ID is not in the Database");
    };
}

function searchEmployee() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create CustomerDB Database\' first');
        return;
    }

    var transaction = db.transaction(["employees"], "readwrite");

    transaction.oncomplete = function (event) {
        console.log("DONE: employee searched.");
    };

    transaction.onerror = function (event) {
        console.log("transaction.onerror errcode=" + event.target.error.name);
    };

    var objectStore = transaction.objectStore("employees");

    var employeeToSearch = {};

    employeeToSearch.employeeId = parseInt(document.querySelector("#employeeId").value);

    alert('Looking for employee ID =' + employeeToSearch.employeeId);

    var request = objectStore.get(employeeToSearch.employeeId);

    request.onsuccess = function (event) {
        console.log("Employee found" + event.target.result.name);
        document.querySelector("#name").value = event.target.result.name;
        document.querySelector("#email").value = event.target.result.email;
    };
    request.onerror = function (event) {
        alert("request.onerror, could not find employee, errcode = " + event.target.error.name + ". The employee ID is not in Database");
    };

}
function searchEmployeeShort() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create CustomerDB Database\' first');
        return;
    }

    db.transaction("employees").objectStore("employees")
        .get(document.querySelector("#employeeId").value).onsuccess = function (event) {
            document.querySelector("#name").value = event.target.result.name;
            document.querySelector("#email").value = event.target.result.email;
        };
}

function listAllEmployees() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create EmployeeDB Database\' first');
        return;
    }

    var objectStore = db.transaction("employees").objectStore("employees");

    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            alert("Name for ID " + cursor.key + " is " + cursor.value.name);
            cursor.continue();
        } else {
            alert("No more entries!");
        }
    };
}

function listAllEmployeesArray() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create CustomerDB Database\' first');
        return;
    }

    var objectStore = db.transaction("employees").objectStore("employees");

    var employees = [];

    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            employees.push(cursor.value);
            cursor.continue();
        } else {
            alert("Got all employees: " + employees);
        }
    };
}

function getEmployeeByName() {
    if (db === null) {
        alert('Database must be opened first, please click \'Create CustomerDB Database\' first');
        return;
    }

    var objectStore = db.transaction("employees").objectStore("employees");

    var index = objectStore.index("name");
    index.get("Dan").onsuccess = function (event) {
        alert("Dan's employee ID is " + event.target.result.employeeId +
            " his email is " + event.target.result.email);
    };
}

function removeIndexedDB() {
    let DBDeleteRequest = window.indexedDB.deleteDatabase("EmployeeDB");

    DBDeleteRequest.onerror = function (event) {
        console.log("Error deleting database.");
    };

    DBDeleteRequest.onsuccess = function (event) {
        console.log("EmployeeDB deleted successfully");
        console.log(event.result); // should be undefined
    };
}