# JSTable

A complete tool to make the most of HTML tables in Javascript.

## Get started

First of all, you need to add the source code to your HTML page:

```
<script src="JSTable.js"></script>
```

Now, you can create a new `JSTable()` which takes a lot of arguments in a single object:

```
var table = new JSTable({
    orientation: 'horizontal', // 'vertical' or 'horizontal', 'horizontal' is the default value
    parent: '#container', // the query selector of the parent, by default: document.body
    title: 'A weird test', // the title of the table
    titlePos: 'top', // the position of the title: 'top' by default, or 'bottom'
    cellsPerLine: 4, // the number of cells per line
    commonClass: "aClass anotherClass" // classes common to all cells
    cells: // the cells to put inside the table
    [
        // each array inside `cells` is a line of your table
        [
            new Cell(""), // an empty cell in the upper left corner
            new MainCell("Age"), // a main cell (<th>)
            new MainCell("City"),
            new MainCell("Sex")
        ],
        [
            new MainCell("Thomas"),
            new Cell("17 ans"),
            new Cell("No data"),
            new Cell("Male"),
        ],
        [
            new MainCell("Sarah"),
            new Cell("17 ans"),
            new Cell("No data"),
            new Cell("Female"),
        ]
    ],
    attributes: [{name: 'class', value: 'tables'}] // attributes for <table>, by default: []
});
```

Generate the table with the method `generate(orientation?: string)`:

```
table.generate();
```

This will generate a table inside the given parent element.

## The arguments for JSTable

JSTable takes only one argument: an object. However, inside this object, you can put some options...Here is a summary:

|Name|Type|Default value|description|
|----|----|-------------|-----------|
|parent|string|document.body|The query selector of the parent in which to put the generated table.|
|title|string|_empty string_|The title of the table (`<caption>`)|
|titlePos|string|'top'|The position of the title (caption-side CSS property): 'bottom' or 'top'.|
|orientation|string|'horizontal'|The orientation of the table: 'vertical' or 'horizontal'.|
|cells|`Array<Array<PartOfTable\|BreakPointCell>>`|_empty array_|An array that contains all the cells of the table.|
|attributes|`Array<Object>`|_empty array_|An array in which you can define some attributes to be added to the generated table.|
|cellsPerLine|number|The number of cells in the first line|The number of cells per line|
|commonClass|string|_none_|The classes to add to each cell. Separate the classes with white spaces.|

To go further, you also have some methods from JSTable (which extends from `TableManager`) :

|Method|Description|
|------|-----------|
|`getOrientation()`|Gets the orientation of the table.|
|`setOrientation()`|Sets the orientation of the table: 'vertical' or 'horizontal' (by default).|
|`generate(orientation?: string)`|Generates the table according to the orientation. If you set an orientation using this method, then this orientation will be chosen rather than the default one given via JSTable instantiation.|
|`setCells(cells: Array<Array<PartOfTable\|BreakPointCell>>, cellsPerLine: number, commonClass?: string)`|Set the cells that the table will contain.|
|`getCells()`|Get the cells contained in the table.|
|`getTable()`|Returns the generated table. Returns `null` if the table does not yet exist.|
|`setCommonClass(commonClass: string)`|Set classes common to all cells. Separate the classes with white spaces.|

The first two methods are there, but you should not have to use them. The last two methods are used for interpretation.

## Cells

You have 3 types of cells, which extend from `PartOfTable`:

+ `Cell(content: string|HTMLElement, options?: {})`: a basic cell (`<td>`)
+ `MainCell(content: string|HTMLElement, options?: {})`: a main cell (`<th>`)
+ `RandomCell(min: number, max: number, options?: {})`: a cell with a random integer (`<td>`) and a specific class: 'cell-random'.

To each cell, you can add specific options:

|Name|Type|Default value|description|
|----|----|-------------|-----------|
|rowspan|int|1|rowspan attribute|
|colspan|int|1|colspan attribute|
|scope|string|_empty string_|scope attribute|
|id|string|_empty string_|id attribute|
|classname|string|_empty string_|The classes of the cell. Separate the classes with spaces: 'class1 class2 class3'|

From each cell, you have some basic methods:

+ `getContent()`: get the content inside the cell.
+ `setContent(content: string|HTMLElement)`: set the content inside the cell.
+ `getRowspan()`: get the value of the rowspan attribute.
+ `getColspan()`: get the value of the colspan attribute.
+ `getScope()`: get the value of the scope attribute.
+ `getID()`: get the ID of the cell.
+ `getClassname()`: get the className attribute.
+ `isHTMLElement()`: returns true if the content inside the cell is a HTML element.
+ `addSingleClass(cla: string)`: adds a single class to the cell.
+ `isAllowedToInterpret()`: is JSTable allowed to interpret the code inside the cell?
+ `disableInterpretation()`: Disables the interpretation of the codes contained in the cell.
+ `enableInterpretation()`: Enables the interpretation of the codes contained in the cell.

## BreakPointCell()

Each line (in `cells`) must have the same number of cells as the first line Therefore, you can put fake cells with `BreakPointCell()` instead of a classic cell. This is useful if you want to use `rowspan` or `colspan`. Just like this:

```
var table = new JSTable({
    orientation: 'horizontal',
    parent: '#container',
    title: 'A weird test',
    titlePos: 'top',
    cells:
    [
        [
            new Cell(""),
            new MainCell("Age"),
            new MainCell("City"),
            new MainCell("Sex")
        ],
        [
            new MainCell("Thomas"),
            new Cell("17 ans"),
            new Cell("Lille"),
            new Cell("Male"),
        ],
        [
            new MainCell("Sarah"),
            new Cell("No data", {colspan: 2}), // will take the place of the following cell
            new BreakPointCell(), // but, we must have 4 cells in each line in order to avoid an error
            new Cell("Female"),
        ]
    ]
});

table.generate();
```

*Warning*: if you use `rowspan` AND `colspan`, then you may have to change the javascript structure of your table if you change the orientation. However, since v1.1.0, rowspan and colspan attributes are better implemented.

## RandomCell()

A `RandomCell()` is juste like a classic `Cell()`, but this cell generates a random integer between a minimum and a maximum value. Besides, this cell has a specific CSS class added when generating the table: 'cell-random'.

How to build a `RandomCell` ?

|Name|Type|Default value|description|
|----|----|-------------|-----------|
|min|integer|_required_|The minimum random number (included)|
|max|integer|_required_|The maximum random number (included)|

From a `RandomCell`, you have specific methods:

+ `getRandomIntInclusive(min, max)` generates a random number between `min` (included) & `max` (included).
+ `getGeneratedRandomNumber()` returns the generated random number.
+ `setRandomNumber(number)` sets the random number.
+ `generateNewRandomNumber(min, max)` generates a new random number between `min` (included) & `max` (included) for this cell.

## Create your own cell type

By default, all cells extend from `PartOfTable` (except for `BreakPointCell`). Therefore, if you want to create your own cell type, then start with this template:

```
// The minimum structure: 
class CustomCell extends PartOfTable {
    /**
     * ...
     * @param {string|HTMLElement} content The content to be displayed in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(content, options) {
        super(content, options);
    }

    // ... your additional methods
}
```

## TableManager():

In order to manipulate more advanced tables, then use `TableManager`. `JSTable` extends from TableManager. However, it's recommended not to use both at the same time.

With `TableManager`, you can do a lot of things, like interpreting the content of cells to do mathematics, for instance. Here is a summary of all the methods from `TableManager`:

|Method|Description|
|------|-----------|
|_`constructor(table: HTMLTableElement)`_|Defines the current table you are working on in order to avoid unnecessary repetition when calling up the methods.|
|`setCurrentTable(table: HTMLTableElement)`|Sets the current table you are working on.|
|`getCurrentTable()`|Gets the current table you are working on.|
|`selectCell(identifier: string, table?: HTMLTableElement)`|Select a cell from its identifier.|
|`selectMultipleCells(identifier: string, table?: HTMLTableElement)`|Select all the cells in a table at a specific line, from a starting point to an ending point.|
|`getSequencesFrom(content: string)`|We read the content in order to get all the sequences to interpret.|
|`interpret(content: string, table?: HTMLTableElement)`|Read the content of a cell in order to interpret it.|
|`deleteTable(table?: HTMLTableElement)`|Permanently deletes a table.|
|`clearCell(identifier: string, table?: HTMLTableElement)`|Clear the content of a cell.|
|`generateLine(options: {...})`|Returns a line to be added to a table via `addLine()`.|
|`generateCell(cell: PartOfTable, table?: HTMLTableElement)`|Generates a cell to put in the table.|
|`addLine(line: Array<PartOfTable\|BreakPointCell>, table?: HTMLTableElement)`|Adds a line in a table.|

## How to select cells ?

In order to select a single cell, you have to use a specific syntax: `#r-d`, where `r` is the line number and `d` is the cell number. For instance, if I want to select the first cell of the second line, I'll write: '#1-0'. Indeed, we start counting at 0. So the first line is 0, then 1 etc. same for cell number.

```
var cell = manager.selectCell("#1-0");
```

However, you can select multiple cells via `selectMultipleCells()` (only). For that, you have to define a specific line, then write the starting point (included) and the ending point (included). For example, if I want to select the first 4 cells on the first line of my table, then I'll write: '#0-0:3'. Indeed, the first line is 0, and I want the cells number 0, 1, 2, 3 (the first 4).

```
var cells = manager.selectMultipleCells("#0-0:3"); // returns an array
```

## How to interpret sequences ?

The above syntax is just for `selectCell()` or `selectMultipleCells()`. However, if you want to duplicate the content of another cell, or if you want to do mathematics with the content of other cells, then you'll need *sequences*.

It's pretty much the same thing actually, but you must add brackets to separate multiple sequences from the same string. For instance, I have a table that has 5 cells on a single row. Each cell contains a number. The last cell is the sum of all the previous cells. I don't know the numbers that are contained inside the cells, therefore I'll need a way to select their content:

```
var table = new JSTable({
    orientation: 'horizontal',
    parent: '#container',
    title: 'Maths in a table',
    titlePos: 'top'
});

// `cells` will contain 5 cells (four are generated, the fifth comes from `endsWith`)
cells = [
    table.generateLine({
        cellsToGenerate: 4,
        inLine: function(i) {
            return new RandomCell(0, 9);
        },
        endsWith: new MainCell("")
    })
];

table.setCells(cells, 5); // 5 is the number of cells per line
table.generate(); // we generate the table before using TableManager on it.

// TableManager():

var manager = new TableManager();
manager.setCurrentTable(table.getTable()); // in order to avoid unnecessary repetition

// just for the example, we'll calculate the sum of numbers contained in an array
function sum(cells) {
    var S = 0;
    for (var cell of cells) {
        S += parseInt(cell.innerHTML);
    }
    return S;
}

var totalCell = manager.selectCell("#1-4"); // we select the cell that must contain the sum
totalCell.innerHTML = sum(manager.selectMultipleCells("#1-0:3")); // 0:3 because we start counting at 0, so we select 0, 1, 2, 3
// This line above is strictly equal to:
// totalCell.innerHTML = manager.interpret("{#1-0 + #1-1 + #1-2 + #1-3}");
```