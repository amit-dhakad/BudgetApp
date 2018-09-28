/**
 * * BUDGET CONTROLLER
 */
let budgetController = (() => {
  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  let calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(element => {
      sum += element.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      expense: [],
      income: []
    },

    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: (type, des, val) => {
      let newItem, ID;
      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === 'expense') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }
      // push into data structure
      data.allItems[type].push(newItem);
      // return new item
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids;
      let index;
      ids = data.allItems[type].map(element => {
        return element.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // calculate total income and expenses
      calculateTotal('expense');
      calculateTotal('income');

      // Calculate the budget: income - expenses
      data.budget = data.totals.income - data.totals.expense;
      // calculate the percentage of income that we spent
      if (data.totals.income > 0) {
        data.percentage = Math.round(
          (data.totals.expense / data.totals.income) * 100
        );
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 200, spent 50% = 100/200 = 0.5 * 100
    },

    calculatePercentages: () => {
      data.allItems.expense.forEach(element => {
        element.calcPercentage(data.totals.income);
        console.log('element: ', element);
      });
    },

    getPercentages: () => {
      let allPerc = data.allItems.expense.map(element => {
        return element.getPercentage();
      });
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.income,
        totalExp: data.totals.expense,
        percentage: data.percentage
      };
    },

    testing: () => {
      console.log('data', data);
    }
  };
})();

/**
 * * UI CONTROLLER
 */
let UIController = (() => {
  let DOMString = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  let formatNumber = (num, type) => {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  let nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMString.inputType).value, // will be either income or expense
        description: document.querySelector(DOMString.inputDescription).value,
        value: parseFloat(document.querySelector(DOMString.inputValue).value)
      };
    },

    addListItem: (obj, type) => {
      let html, newHtml, element;
      // create HTML  string with placeholder text

      if (type === 'income') {
        element = DOMString.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === 'expense') {
        element = DOMString.expenseContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div> </div> </div>';
      }
      // Replace the placeholder text with osme actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: selectorID => {
      let element;
      element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: () => {
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMString.inputDescription + ', ' + DOMString.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach((element, index, array) => {
        element.value = '';
      });
      fieldsArr[0].focus();
    },

    displayBudget: obj => {
      let type;
      obj.budget > 0 ? (type = 'income') : (type = 'expense');
      document.querySelector(DOMString.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMString.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'income'
      );
      document.querySelector(DOMString.expenseLabel).textContent = formatNumber(
        obj.totalExp,
        'expense'
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMString.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMString.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: percentages => {
      let fields = document.querySelectorAll(DOMString.expensesPercLabel);

      nodeListForEach(fields, (element, index) => {
        if (percentages[index] > 0) {
          element.textContent = percentages[index] + '%';
        } else {
          element.textContent = '---';
        }
      });
    },

    displayMonth: () => {
      let now, year, month, months;
      now = new Date();
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMString.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changeType: () => {
      let fields = document.querySelectorAll(
        DOMString.inputType +
          ',' +
          DOMString.inputDescription +
          ',' +
          DOMString.inputValue
      );

      nodeListForEach(fields, element => {
        element.classList.toggle('red-focus');
      });

      document.querySelector(DOMString.inputButton).classList.toggle('red');
    },

    getDOMStrings: () => {
      return DOMString;
    }
  };
})();

/**
 * * GLOBAL APP CONTROLLER
 */
let controller = ((budgetCtrl, UICtrl) => {
  let setupEventListners = () => {
    let DOM = UICtrl.getDOMStrings();

    document
      .querySelector(DOM.inputButton)
      .addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  };

  let updateBudget = () => {
    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2. return budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the ui
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = () => {
    // 1. Calculate percentage
    budgetCtrl.calculatePercentages();

    // 2. Read percentage from the budget controller
    let percentages = budgetCtrl.getPercentages();

    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };
  let ctrlAddItem = () => {
    let input, newItem;
    // 1. Get field input data

    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add th item to budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add item to the ui
      UICtrl.addListItem(newItem, input.type);

      // 4. clear fields

      UICtrl.clearFields();
      // 5. calculate and update budget
      updateBudget();

      // 6. Calculate and update percentage
      updatePercentages();
    }
  };

  let ctrlDeleteItem = event => {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delee the item from the data strcture
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentage
      updatePercentages();
    }
  };

  return {
    init: () => {
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListners();
    }
  };
})(budgetController, UIController);

controller.init();
