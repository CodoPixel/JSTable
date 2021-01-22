/**
 * The parent class of `Cell` & `MainCell`. Do not use it separately.
 */
class PartOfTable {
    /**
     * The cell of a table.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        this.text = text;

        if (!options) options = {};
        this.rowspan = options.rowspan || 1;
        this.colspan = options.colspan || 1;
        this.scope = options.scope || '';
        this.id = options.id || '';
        this.classname = options.classname || '';
        this.allowInterpretation = true;
    }

    invertRowspanAndColspan() {
        try {
            [this.rowspan, this.colspan] = [this.colspan, this.rowspan];
        } catch(e) {
            console.error("A feature is not supported by your navigator because it is too old.");
        }
    }

    getText() { return this.text; }
    getRowspan() { return this.rowspan; }
    getColspan() { return this.colspan; }
    getScope() { return this.scope; }
    getID() { return this.id; }
    getClassname() { return this.classname; }
    isAllowedToInterpret() { return this.allowInterpretation; }
    disableInterpretation() { this.allowInterpretation = false; }
    enableInterpretation() { this.allowInterpretation = true; }
}

/**
 * A future `<td>` (a classic cell) in your generated table.
 */
class Cell extends PartOfTable {
    /**
     * A Cell will be, in HTML, a `<td>`.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        super(text, options);
    }
}

/**
 * A future `<th>` (a main cell) in your generated table.
 */
class MainCell extends PartOfTable {
    /**
     * A MainCell will be, in HTML, a `<th>`.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        super(text, options);
    }
}

/**
 * Generates a cell with a random number in it and to each cell, we add a specific class: 'cell-random'.
 */
class RandomCell extends PartOfTable {
    /**
     * Generates a cell with a random number in it and to each cell, we add a specific class: 'cell-random'.
     * @param {number} min The minimum random number
     * @param {number} max The maximum random number
     * @param {Array<Object<String>>} options Options you can add to the cell.
     */
    constructor(min, max, options) {
        if (options) {
            if (options.classname) {
                options.classname += " cell-random";
            } else {
                options.classname = "cell-random";
            }
        } else {
            options = {classname: "cell-random"};
        }

        super("", options);

        this.min = Math.ceil(min) || 0;
        this.max = Math.floor(max) || 1;
        this.number = this.getRandomIntInclusive();
        
        this.text = this.number.toString();
    }

    /**
     * @returns {number} A random number between `min` (included) & `man` (included).
     */
    getRandomIntInclusive() {
        return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    }

    /**
     * Get the generated random number during the creation of the cell.
     */
    getNumber() { return this.number; }
}

/**
 * Generates a fake cell in order to the cells to have rowspan & colspan attributes without throwing an Error.
 */
class BreakPointCell {
    constructor() {}
}

/**
 * Thanks to JSTable, you can create a table using Javascript.
 */
class JSTable {
    /**
     * Defines the primary requirements for JSTable to generate a table.
     * @param {string} parent The query selector of the parent in which to put the generated table.
     * @param {string} title The title of the table (`<caption>`).
     * @param {string} titlePos The position of the title (caption-side CSS property): 'bottom' or 'top' (by default).
     * @param {string} orientation The orientation of the table: 'vertical' or 'horizontal' (by default).
     * @param {Array<Array<PartOfTable|BreakPointCell>>} cells An array that contains all the cells of the table.
     * @param {Array<Object>} attributes An array in which you can define some attributes to add to the generated table.
     * @param {number} cellsPerLine The number of cells per line.
     */
    constructor({parent, title, titlePos, orientation, cells, attributes, cellsPerLine}) {
        this.parent = document.querySelector(parent) || document.body;
        this.title = title || '';
        this.titlePos = titlePos || 'top';
        this.cells = cells || [];
        this.attributes = attributes || [];
        this.cellsPerLine = cellsPerLine;
        this.setOrientation(orientation);
        this.table = null;
    }

    /**
     * @returns {HTMLTableElement} The generated table. Returns `null` if the table does not yet exist.
     */
    getTable() { return this.table; }

    /**
     * Gets the orientation of the table.
     * @returns {string} The orientation of the table: 'vertical' or 'horizontal'. Horizontal by default.
     */
    getOrientation() { return this.orientation; }

    /**
     * Sets the orientation of the table. 
     * @param {string} orientation
     */
    setOrientation(orientation) {
        if (!orientation) orientation = 'horizontal';
        if (orientation != 'horizontal' && orientation != 'vertical') {
            throw new Error("JSTable: orientation must be 'vertical' or 'horizontal'.");
        }
        this.orientation = orientation;
    }

    /**
     * Set the cells that the table will contain.
     * @param {Array<Array<PartOfTable|BreakPointCell>>} cells An array that contains all the cells of the table. By default an empty array.
     * @param {number} cellsPerLine The number of cells per line.
     */
    setCells(cells, cellsPerLine) {
        this.cellsPerLine = cellsPerLine;
        this.cells = cells || [];
    }

    /**
     * Get the cells contained in the table.
     * @returns {Array<Array<PartOfTable|BreakPointCell>>} The cells of the table.
     */
    getCells() {
        return this.cells;
    }

    /**
     * Generates the `<caption>` of the table.
     */
    _genCaption() {
        var caption = document.createElement('caption');
        caption.innerHTML = this.title || '';
        caption.style.captionSide = this.titlePos;
        this.table.appendChild(caption);
    }

    /**
     * Generates a `<td>` or a `<th>` to put in the table.
     * @param {PartOfTable} cell A cell to put in the table.
     * @returns {HTMLTableDataCellElement} A new cell for the table.
     */
    _genCell(cell) {
        var htmlCell = document.createElement('td');
        if (cell instanceof MainCell) htmlCell = document.createElement('th');

        if (cell.isAllowedToInterpret) {
            htmlCell.innerHTML = this.interpret(cell.getText());
        } else {
            htmlCell.innerHTML = cell.getText();
        }
        htmlCell.setAttribute('rowspan', cell.getRowspan());
        htmlCell.setAttribute('colspan', cell.getColspan());
        htmlCell.setAttribute('scope', cell.getScope());
        htmlCell.setAttribute('id', cell.getID());
        if (cell.getClassname()) {
            var classes = cell.getClassname().trim().split(' ');
            classes.forEach(function(clas) {
                htmlCell.classList.add(clas);
            });
        }
        return htmlCell;
    }

    /**
     * We pretend that the painting is vertical while we build it horizontally.
     * @returns {Array<Array<PartOfTable|BreakPointCell>>} An array of arrays of cells.
     */
    _reorganizeCellsForVerticalTable() {
        var numberOfColumns = this.cells.length;
        var numberOfLines = this.cellsPerLine || this.cells[0].length; // every line must have the same number of cells.

        // destructure the input
        var newArrayOfCells = []; // [[0, 0], [1, 1], [2, 2], [3, 3]]
        for (var i = 0; i < numberOfLines; i++) {
            newArrayOfCells[i] = [];
            for (var e = 0; e < numberOfColumns; e++) {
                var currentCell = this.cells[e][i];
                if (currentCell instanceof PartOfTable) currentCell.invertRowspanAndColspan();
                newArrayOfCells[i][e] = currentCell;
            }
        }

        return newArrayOfCells;
    }

    /**
     * Generates duplicated cells inside a same line.
     * @param {PartOfTable} startsWith The beginning of the line (optional)
     * @param {Function} inLine The cells to be generated inside the line
     * @param {PartOfTable} endsWith The end of the line (optional);
     * @returns {Array<PartOfTable>} The generated line which contained cells
     */
    generateLine({startsWith, inLine, endsWith}) {
        var line = [];
        if (startsWith) line[0] = startsWith; 

        if (!this.cellsPerLine) {
            throw new Error("You must define a number of cells per line if you want to use 'generateLine()'.");
        }

        for (var i = 0; i < this.cellsPerLine; i++) {
            line[line.length] = inLine(i);
        }
        
        if (endsWith) line[line.length] = endsWith;
        return line;
    }

    /**
     * Gets the content of a cell from `table`.
     * @param {string} identifier `#r-d` => `r` is the line number, `d` is the cell number. *The numbers begin at 0*. You cannot get the contents of a cell if it is in the same line when creating that same line.
     * @param {HTMLTableElement} table The table in which you want to read the contents of the cell.
     * @returns {string} The content of the cell. Returns an empty string if the cell is not found.
     */
    readCell(identifier, table) {
        if (!table) table = this.table;
        if (!/#[0-9]{1,}-[0-9]{1,}/gmi.test(identifier)) return '';

        var line = identifier.match(/[0-9]{1,}/gm)[0];
        var cell = identifier.match(/[0-9]{1,}/gm)[1];

        var allTr = table.querySelectorAll('tr');
        if (!allTr[line]) {
            console.error("readCell(): unable to find the content of the cell. The line doesn't exist.");
            return '';
        }
        
        try {
            var content = allTr[line].childNodes[cell].innerHTML;
            return content;
        } catch (e) {
            console.error("readCell(): unable to interpret the content of the cell. The cell doesn't exist.");
            return '';
        }
    }

    _getSequencesFrom(content) {
        var sequenceRegex = /\{[\D\d][^}]{1,}/gmi;
        return content.match(sequenceRegex);
    }

    interpret(content) {
        if (/#[0-9]{1,}-[0-9]{1,}/gmi.test(content)) {
            var allSequences = this._getSequencesFrom(content);
            var newContent = content;
            var self = this;

            // First of call, replace the symbols "#r-l" by their content.
            allSequences.forEach(function(sequence) {
                var allCalls = sequence.match(/#[0-9]{1,}-[0-9]{1,}/gmi);
                for (var call of allCalls) {
                    newContent = newContent.replace(new RegExp(call, "g"), self.readCell(call, self.table));
                }
            });

            try {
                // Do the calculations inside the content
                this._getSequencesFrom(newContent).forEach(function(sequence) {
                    var evaluatedContent = eval(sequence.replace(/\{|\}/gm, ""));
                    newContent = newContent.replace(sequence, evaluatedContent.toString());
                });
                // Replace these brackets
                newContent = newContent.replace(/\{|\}/gm, "");
            } catch(e) {
                console.info("Unable to evaluate the content inside the cell while interpreting it.");
            } finally {
                return newContent;
            }
        } else {
            return content;
        }
    }

    /**
     * Generates the table according to its orientation.
     * @param {string} orientation The orientation of the table.
     */
    generate(orientation) {
        if (!orientation) {
            orientation = this.orientation;
        }

        this.table = document.createElement('table');

        if (this.attributes) {
            var self = this;
            this.attributes.forEach(function(attr) {
                self.table.setAttribute(attr.name, attr.value);
            });
        }

        var cells = this.cells;
        if (orientation === "vertical") cells = this._reorganizeCellsForVerticalTable();

        for (var line of cells) {
            var tr = document.createElement('tr');
            // TODO: we must be able to interpret the content of the same line while the creating this line.
            for (var cell of line) {
                if (cell instanceof BreakPointCell) continue;
                tr.appendChild(this._genCell(cell));
            }
            this.table.appendChild(tr);
        }

        this.parent.appendChild(this.table);
    }
}