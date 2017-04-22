require('console.table');
var mysql = require('mysql');
var inquirer = require('inquirer');

var itemsList = 0;
var total = 0;

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'Bamazon'
})

connection.connect(function(error) {
    if (error) throw error;
    goShopping();
});

var goShopping = function() {
    inquirer.prompt({
        name: "goShopping",
        type: "confirm",
        message: "Is there anything needed from Bamazon?",
    }).then(function(answer) {
        if (answer.goShopping) {
            printProducts();
        } else {
            console.log("Thank you for shopping at Bamazon, see you soon!!!");
        }
    });
};




function Inventory(newValue, id) {
    connection.query("UPDATE products SET stock_quantity=" + newValue + " WHERE item_id=" + id, function(error, response) {
        if (error) throw error;
    });
}

var searchForProduct = function() {
    inquirer.prompt([{
        name: "productId",
        type: "input",
        message: "Can please provide the ID of the item you would like to purchase?",
        validate: function(value) {
            if (isNaN(value) === false && (value <= itemsList) && (value != 0)) {
                return true;
            }
            return false;
        }
    }, {
        name: "quantity",
        type: "input",
        message: "How many would you like to order?",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    }]).then(function(answer) {

        var productId = parseInt(answer.productId) - 1;
        var quantityCount = parseInt(answer.quantity);
        var inStock;
        var updatedStock;


        connection.query("SELECT * FROM products WHERE item_id=" + answer.productId, function(error, response) {
            if (error) throw error;

            inStock = response[0].stock_quantity;

            if (quantityCount <= inStock) {

                updatedStock = inStock - quantityCount;

                Inventory(updatedStock, answer.productId);
                total += (answer.quantity * response[0].price);
                console.log("Your total is $" + total);
                goShopping();

            } else {
                console.log("Unfortunately, there's not enough inventory to complete your order. \nPlease try ordering another item.");
                goShopping();
            }

        });

    });
};

function printProducts() {
    connection.query("SELECT * FROM products", function(error, response) {
        if (error) throw error;
        console.log("Welcome to the Bamazon store!!!");
        console.table(response);
        itemsList = response.length;
        searchForProduct();
    });
}
