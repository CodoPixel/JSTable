/**
 * The parent class of `Cell` & `MainCell`. Do not use it separately.
 */
class PartOfTable {
    /**
     * The cell of a table.
     * @param {string|HTMLElement} content The content to be displayed in the cell.
     * @param {object} options Options you can add to the cell.
     */
    constructor(content, options) {
        this.isElement = content instanceof HTMLElement;
        this.content = content;

        if (!options) options = {};
        this.rowspan = options.rowspan || 1;
        this.colspan = options.colspan || 1;
        this.scope = options.scope || '';
        this.id = options.id || '';
        this.classname = options.classname || '';
        this.allowInterpretation = true;
    }

    /**
     * When you change the orientation of a table, then the rowspan becomes colspan & colspan becomes rowspan.
     */
    invertRowspanAndColspan() {
        try {
            [this.rowspan, this.colspan] = [this.colspan, this.rowspan];
        } catch(e) {
            var temp_rowspan = this.rowspan;
            var temp_colspan = this.colspan;
            this.colspan = temp_rowspan;
            this.rowspan = temp_colspan;
            console.info("A feature is not properly supported by your navigator because it is too old. Consider changing your browser.");
        }
    }

    /**
     * @returns {boolean} true if the content inside the cell is a HTMLElement.
     */
    isHTMLElement() { return this.isElement; }

    /**
     * @returns {string} The content displayed inside the cell.
     */
    getContent() { return this.content; }

    /**
     * @returns {number} The rowspan value.
     */
    getRowspan() { return this.rowspan; }

    /**
     * @returns {number} The colspan value.
     */
    getColspan() { return this.colspan; }

    /**
     * @returns {string} The scope of the cell.
     */
    getScope() { return this.scope; }
    
    /**
     * @returns {string} The id of the cell.
     */
    getID() { return this.id; }

    /**
     * @returns {string} The classes of the cell. Separate the different classes with white spaces.
     */
    getClassname() { return this.classname; }

    /**
     * Adds a single class to the cell.
     * @param {string} cla A class to add to the cell.
     */
    addSingleClass(cla) {
        if (this.classname.length > 0) {
            this.classname += " " + cla;
        } else {
            this.classname = cla;
        }
    }

    /**
     * @returns {boolean} Is JSTable allowed to interpret the code inside the cell ?
     */
    isAllowedToInterpret() { return this.allowInterpretation; }

    /**
     * Disables the interpretation of the codes contained in the cell.
     */
    disableInterpretation() { this.allowInterpretation = false; }

    /**
     * Enables the interpretation of the codes contained in the cell.
     */
    enableInterpretation() { this.allowInterpretation = true; }
}

/**
 * A future `<td>` (a classic cell) in your generated table.
 */
class Cell extends PartOfTable {
    /**
     * A Cell will be, in HTML, a `<td>`.
     * @param {string|HTMLElement} text The text to be contained in the cell.
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
     * @param {string|HTMLElement} text The text to be contained in the cell.
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

        this.number = this.getRandomIntInclusive(min, max);
        this.content = this.number.toString();
    }

    /**
     * @param {number} min The minimum random number (included).
     * @param {number} max The maximum random number (included).
     * @returns {number} A random number between `min` (included) & `man` (included).
     */
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @returns {number} Get the generated random number during the creation of the cell.
     */
    getGeneratedRandomNumber() { return this.number; }

    /**
     * Set the random number that the cell has to contain.
     * @param {number} number The random number to be displayed.
     */
    setRandomNumber(number) { this.number = number || 0; }
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
     * @param {number} cellsPerLine The number of cells per line. Useless for horizontal tables.
     */
    constructor({parent, title, titlePos, orientation, cells, attributes, cellsPerLine, commonClass}) {
        this.parent = document.querySelector(parent) || document.body;
        this.title = title || '';
        this.titlePos = titlePos || 'top';
        this.cells = cells || [];
        this.attributes = attributes || [];
        this.cellsPerLine = cellsPerLine;
        this.commonClass = commonClass;
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
     * Set classes common to all cells.
     * @param {string} commonClass The classes to add to each cell. Separate the classes with white spaces.
     */
    setCommonClass(commonClass) {
        if (!commonClass) {
            if (!this.commonClass) {
                return;
            } else {
                commonClass = this.commonClass;
            }
        } else {
            this.commonClass = commonClass;
        }

        var self = this;
        var classes = commonClass.split(" ");
        classes.forEach(function(cla) {
            self.cells.forEach(function(line) {
                line.forEach(function(cell) {
                    cell.addSingleClass(cla);
                });
            });
        });
    }

    /**
     * Set the cells that the table will contain.
     * @param {Array<Array<PartOfTable|BreakPointCell>>} cells An array that contains all the cells of the table. By default an empty array.
     * @param {number} cellsPerLine The number of cells per line.
     */
    setCells(cells, cellsPerLine, commonClass) {
        this.cellsPerLine = cellsPerLine;
        this.cells = cells || [];
        if (commonClass) {
            this.setCommonClass(commonClass);
        }
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

        if (cell.isAllowedToInterpret() && !cell.isHTMLElement()) {
            htmlCell.innerHTML = this.interpret(cell.getContent());
        } else {
            if (cell.isHTMLElement()) {
                htmlCell.appendChild(cell.getContent());
            } else {
                htmlCell.innerHTML = cell.getContent();
            }
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
     * @param {number} cellsToGenerate The number of cells that has to be generated.
     * @returns {Array<PartOfTable>} The generated line which contained cells
     */
    generateLine({startsWith, inLine, cellsToGenerate, endsWith}) {
        var line = [];
        if (startsWith) line[0] = startsWith;

        if (!cellsToGenerate) {
            throw new Error("You must define a number of cells per line if you want to use 'generateLine()'.");
        }

        try {
            for (var i = 0; i < cellsToGenerate; i++) {
                line[line.length] = inLine(i);
            }
        } catch(e) {
            throw new Error("JSTable generateLine(): cannot execute the function from the inLine parameter.");
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

    /**
     * We read the content in order to get all the sequences to interpret.
     * @param {string} content The content of a cell.
     * @returns {Array<string>} The sequences.
     */
    _getSequencesFrom(content) {
        var sequenceRegex = /\{[\D\d][^}]{1,}/gmi;
        return content.match(sequenceRegex);
    }

    /**
     * Read the content of a cell in order to interpret it.
     * @param {string} content The content of a cell.
     */
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

                return newContent;
            } catch(e) {
                console.info("Unable to evaluate the content inside the cell while interpreting it.");
                return content;
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
        if (!orientation) orientation = this.orientation;
        
        this.table = document.createElement('table');
        this.setCommonClass();

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