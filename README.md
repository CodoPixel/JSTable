# JSTable

A complete tool to make the most of HTML tables in Javascript. JSTable offers a new way to interpret tables: read the cells thanks to their coordinates (x, y).

## Get Started

The source code is available in TypeScript & Javascript in the `src` folder. Copy the source code and implement it in your project:

```
<script src="jstable.js"></script>
```

Now, you can use JSTable!

## How to create a table ?

First of all, let's create a two-dimensional Javascript array:

```
var jsArray = [
    ["Last name", "First name", "Age"],
    ["Hawking", "Stephen", "76"],
    ["Einstein", "Albert", "76"]
];
```

Now that our Javascript table is ready, we want to generate the corresponding HTML table:

```
// create an instance of JSTable
var jstable = new JSTable();

// create a HTML table from the Javascript array
// "Example" is the title (caption) of the table
// "bottom" is the position of the title (caption-side property)
var htmlArray = jstable.jsArrayToHtml(jsArray, "Example", "bottom");

// to generate a HTML table, you can specify a container in which to put the table
// by default, the container is 'document.body'
var container = document.getElementById('container');

// use the 'generate' property from JSTable
jstable.generate(htmlArray, container);
```

## Advanced feature: Identifiers

As you can see, "76" is repeated two times, so maybe we could use the 'rowspan' property? To do such things, there are 3 `identifiers`:

+ `@`: placed at the beginning of the string is used to define a cell as a main cell (`th`).
+ `.c*2`: placed at the end of the string, this symbol is used to define the rowspan property. By default, all cells have a rowspan property set to 1.
+ `.r*2`: placed at the end of the string, this symbol is used to define the colspan property. By default, all cells have a colspan property set to 1.

Therefore, let's create a more sophisticated array:

```
var jsArray = [
    ["@Last name", "@First name", "@Age"], // <th>
    ["Hawking", "Stephen", "76.c*2"], // change "2" to whatever you want according to your needs
    ["Aucune donnée.r*2", ".", "."] // use a single "." to skip a cell during its creation
];
```

Technically speaking, the last line has only one cell.

## Advanced feature: Custom Functions

You can add custom functions that are executed during the creation of the HTML table. By default, there are no custom functions. However, you can add one. Let's create a custom function that returns a random int.

```
var jstable = new JSTable('common-class'); // a class that all cells will have
jstable.addCustomFunction({
    name: 'Random', // name of the custom function
    callback: (args) => { // during the creation of a cell, its value will be replaced by the return value of 'callback'
        min = Math.ceil(parseInt(args[0]));
        max = Math.floor(parseInt(args[1]));
        return Math.floor(Math.random() * (max - min)) + min;
    },
    events: [
        ['click', (e) => console.info(e)] // === addEventListener('click', (e) => console.info(e))
    ],
    attributes: [
        ['class', 'random'] // sets the attribute 'class' to 'random'
    ]
});
```

How do we use that feature?

```
var jsArray = [
    ["@Last name", "@First name", "@Age"],
    ["Hawking", "Stephen", "<Random(0, 77)>.c*2"],
    ["Aucune donnée.r*2", ".", "."]
];
```

In this example, the cells containing `<Random(...args)>` will generate a random number (depending on the callback function). Besides, we add to this same cell a "random" class and an event listener.

NB: Every custom function don't necessarly need a callback function, events listeners or attributes.

## Advanced feature: Sequences

As I said before, an HTML table is like an orthogonal plane in which each cell has a precise position at precise coordinates (x, y). Therefore, you can select cells in a table based on x and y coordinates. Select these cells in a `sequence` with `selectors`. A sequence is contained in "{}" and basic selectors are written as follows: `#y-x`. There are also multiple selectors written as follows: `#y1-x1:y2-x2`.

In order to select cells, you have a lot of built-in methods:

|Method|return value|Description|
|------|------------|-----------|
|`selectCell(x:number, y:number, table:HTMLTableElement)`|`Cell`|Select a cell in a table according to precise coordinates. |
|`selectRow(y:number, table:HTMLTableElement)`|`Cell[]`|Selects all the cells from a given row in a table according to its y-axis.|
|`selectSeveralRows(y1:number, y2:number, table:HTMLTableElement)`|`Cell[][]`|Selects all the cells from several rows in a table.|
|`selectColumn(x:number, table:HTMLTableElement)`|`Cell[]`|Selects all the cells from a given column in a table.|
|`selectSeveralColumns(x1:number, x2:number, table:HTMLTableElement)`|`Cell[][]`|Selects all the cells from several columns in a table.|
|`selectMultipleCells(from:Pos, to:Pos, table:HTMLTableElement)`|`Cell[]`|Selects several cells (beginning to end or end to beginning) in a table.|

Theses methods return instances of `Cell`. A Cell is an object with theses properties:

|Method|return value|Description|
|------|------------|-----------|
|`getPos()`|`Pos`|Gets the cell's position.|
|`getElement()`|`HTMLTableCellElement`|Gets the cell as a HTML element.|
|`getTable()`|`HTMLTableElement`|Gets the table in which the cell is contained.|
|`getContainer()`|`HTMLElement`|Gets the container in which the table is contained.|
|`getAttributes`|`string[][]`|Gets all the attributes of the cell.|
|`clearContent`|`void`|Clear the content of the cell.|

NB: `Pos` is a Typescript interface defined as follows:

```
interface Pos {
    x?:number, // by default 0
    y?:number // by default 0
}
```

## More features:

JSTable offers a lot of features:

|Method|return value|Description|
|------|------------|-----------|
|`setCommonClass(cc:string)`|`void`|Adds a common class to all cells when they are being generated.|
|`doesExist(x:number, y:number, table:HTMLTableElement)`|`boolean`|Checks whether a cell exists in a table according to precise coordinates.|
|`getNumberOfCellsPerRow(table: HTMLTableElement)`|`number`|Calculates the maximum number of cells per row in a HTML table.|
|`getNumberOfCells(table: HTMLTableElement)`|`number`|Gets the number of cells in a table.|
|`translate(cell:HTMLTableCellElement)`|`Cell`|Gets an instance of Cell from a cell in a table.|
|`isCell(cell:any)`|`boolean`|Checks if `cell` is an instance of Cell.|
|`deleteTable(table:HTMLTableElement)`|`void`|Permanently deletes a table.|
|`removeColumn(x:number, table:HTMLTableElement)`|`boolean`|Deletes a column from a table.|
|`removeRow(y:number, table:HTMLTableElement)`|`boolean`|Deletes a row from a table.|
|`removeCellAt(x:number, y:number, table:HTMLTableElement)`|`boolean`|Removes a cell at a specific position in a table.|
|`removeCell(cell: Cell)`|`void`|Removes a particular cell in a table.|
|`createCell(text: string, colspan:number=1, rowspan:number=1)`|`HTMLTableCellElement`|Generates a cell to put inside a future HTML table.|
|`addColumn(column:string[], table:HTMLTableElement, index:number=-1)`|`void`|Adds a column in a table at a certain position.|
|`addRow(row:string[], table:HTMLTableElement, index:number=-1)`|`void`|Adds a row in a table at a certain position.|
|`isMultipleSelector(selector:string)`|`boolean`|Checks whether a selector is a multiple selector or not.|
|`readMultipleSelector(selector:string)`|`ComplexPos`<sup>*</sup>|Reads a multiple selector and returns the coordinates.|
|`readBasicSelector(selector:string)`|`Pos`|Reads a basic selector in order to extrapolate the x-axis & y-axis.|
|`addCustomFunction(cF:CustomFunction)`<sup>*</sup>|`void`|Adds a custom function.|
|`interpretCustomFunction(text:string)`|`CustomFunctionInterpretation`<sup>*</sup>|Reads the content of a cell in order to execute the custom function that it might contains.|
|`getSequencesFrom(content:string)`|`string[]`|We read the content in order to get all the sequences to interpret.|
|`interpretSequences(text:string, table:HTMLTableElement)`|`string`|Read sequences & interpret its content.|
|`read(table:HTMLTableElement)`|`HTMLTableElement`|Reads a table in order to do all the necessary interpretations (custom functions & sequences).|
|`jsArrayToHtml(arr:string[][], title?:string, titlePos?:string)`|`HTMLTableElement`|Converts a js array into a HTML table.|
|`htmlTableToJS(table:HTMLTableElement)`|`Cell[][]`|Converts a HTML table into a Javascript array of Cells.|
|`htmlTableToString(table:HTMLTableElement)`|`string[][]`|Transforms an HTML table into an array of strings.|
|`generate(table:HTMLTableElement, container:HTMLElement=document.body)`|`void`|Generates a table in the given parent element.|

<sup>*</sup>NB: `ComplexPos`, `CustomFunction` & `CustomFunctionInterpretation` are Typescript interfaces defined as follows:

```
interface ComplexPos {
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number
};

interface CustomFunction {
    name: string,
    callback?: Function,
    attributes?: string[][],
    events?: [string, Function][]
};

interface CustomFunctionInterpretation {
    newContent: string,
    attributes: string[][],
    events: [string, Function][]
};
```

## License

MIT License