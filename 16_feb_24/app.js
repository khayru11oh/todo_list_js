'use strict';


var budgetController = (function(){
    var Expences = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expences.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expences.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    var calculateTotal = function(type) {
        var summ = 0;
        data.allItems[type].forEach(function(curr) {
            summ += curr.value;
        });
        data.totals[type] = summ;
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
                        
            if(type === 'exp') {
                newItem = new Expences(ID, desc, val);
            } else {
                newItem = new Income(ID, desc, val);
            }
            
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
        testing: function() {
            console.log(data);
        },
    };
})();

var UIController = (function(){
    var DOMInputStrings = {
            inputsType: '.add__type',
            inputsDescription: '.add__description',
            inputsValue: '.add__value',
            addBtn: '.add__btn',
            incomeContainer: '.income__list',
            expencesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            prencentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            dateLabel: '.budget__title--month',
        };

var formatNum = function(num, type) {
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');

            int = numSplit[0];
            dec = numSplit[1];
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
            }
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };

var nodeListForEach = function(list, callback) {
    for(let i = 0; i < list.length; i++) {
        callback(list[i], i);
            }
        };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMInputStrings.inputsType).value,
                description: document.querySelector(DOMInputStrings.inputsDescription).value,
                value: parseFloat(document.querySelector(DOMInputStrings.inputsValue).value),
            };
        },
        addListItems: function(obj, type) {
            var html, newHTML, element;

            if(type === 'inc') {
                element = DOMInputStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMInputStrings.expencesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">-21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNum(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteUIItem: function(selectedID) {
            var el = document.getElementById(selectedID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMInputStrings.inputsDescription + ', ' + DOMInputStrings.inputsValue);

            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMInputStrings.budgetLabel).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMInputStrings.incomeLabel).textContent = formatNum(obj.totalInc, 'inc');
            document.querySelector(DOMInputStrings.expensesLabel).textContent = formatNum(obj.totalExp, 'exp');
            document.querySelector(DOMInputStrings.prencentageLabel).textContent = obj.percentage;

            if(obj.percentage > 0) {
                document.querySelector(DOMInputStrings.prencentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMInputStrings.prencentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var field = document.querySelectorAll(DOMInputStrings.expensesPercLabel);
            nodeListForEach(field, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {

            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['Yanvar', 'Fevral', 'Mart', 'April', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
            month = now.getMonth();
            document.querySelector(DOMInputStrings.dateLabel).textContent = months[month] + ', ' + year;

        },
        
        changeType: function() {
            var fields = document.querySelectorAll(DOMInputStrings.inputsType + ',' + DOMInputStrings.inputsDescription + ',' + DOMInputStrings.inputsValue);
            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMInputStrings.addBtn).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMInputStrings;
        },
    };
})();


var mainController = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
        
            if(event.keyCode === 13 || event.which === 13 || event.key === 'Enter') {
            ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputsType).addEventListener('change', UICtrl.changeType);
    };

    var UpdateBudget = function() {
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };

    var UpdatePercentages = function() {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var inputs, newItems;
        inputs = UICtrl.getInput();

        if(inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0) {
            newItems = budgetCtrl.addItem(inputs.type, inputs.description, inputs.value);
            UICtrl.addListItems(newItems, inputs.type);
            UICtrl.clearFields();
            UpdateBudget();
            UpdatePercentages();
        }
    };
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, typee, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            typee = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(typee, ID);

            UICtrl.deleteUIItem(itemID);

            UpdateBudget();

            UpdatePercentages();
        }
    };
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListener();
        },
    };
})(budgetController, UIController);


mainController.init();