;
;
;
;
class Cell {
    constructor(x, y, element, table) {
        this.x = x || 0;
        this.y = y || 0;
        this.element = element;
        this.table = table;
        this.container = this.table.parentElement;
        this.attributes = [];
        try {
            for (var i = 0; i < this.element.getAttributeNames().length; i++) {
                var name = this.element.getAttributeNames()[i];
                var value = this.element.getAttribute(name);
                this.attributes.push([name, value]);
            }
        }
        catch (e) {
            throw new Error("An error has occured while trying to create a cell from a HTML element.");
        }
    }
    getPos() { return { x: this.x, y: this.y }; }
    getElement() { return this.element; }
    getTable() { return this.table; }
    getContainer() { return this.container; }
    getAttributes() { return this.attributes; }
    clearContent() { this.element.textContent = ""; }
}
class JSTable {
    constructor(commonClass) {
        this.regexColspan = /\.r\*(\d{1,})/;
        this.regexRowspan = /\.c\*(\d{1,})/;
        this.regexMultipleSelector = /#(\d{1,}-\d{1,}:\d{1,}-\d{1,})/g;
        this.regexBasicSelector = /#(\d{1,}-\d{1,})/g;
        this.regexSelectors = /#(\d{1,}-\d{1,}:\d{1,}-\d{1,})|#(\d{1,}-\d{1,})/g;
        this.commonClass = commonClass;
        this.customFunctions = [];
    }
    setCommonClass(commonClass) { this.commonClass = commonClass; }
    doesExist(x, y, table) {
        try {
            var cell = table.rows[y].childNodes[x];
            return cell !== undefined;
        }
        catch (e) {
            return false;
        }
    }
    getNumberOfCellsPerRow(table) {
        var max = 0;
        var rows = Array.from(table.rows);
        for (var line of rows) {
            var n = line.children.length;
            if (n > max)
                max = n;
        }
        return max;
    }
    getNumberOfCells(table) {
        var s = 0;
        for (var row of Array.from(table.rows)) {
            for (var x of Array.from(row.cells)) {
                s++;
            }
        }
        return s;
    }
    selectCell(x, y, table) {
        try {
            var cell = table.rows[y].children[x];
            return cell === undefined ? undefined : new Cell(x, y, cell, table);
        }
        catch (e) {
            return undefined;
        }
    }
    selectRow(y, table) {
        var cells = [];
        var row = table.rows[y];
        for (var x = 0; x < row.childElementCount; x++) {
            cells.push(new Cell(x, y, row.children[x], table));
        }
        return cells;
    }
    selectSeveralRows(y1, y2, table) {
        var i = 0;
        var isReversed = y1 > y2;
        if (isReversed) {
            [y1, y2] = [y2, y1];
        }
        var cells = [];
        for (i = y1; i <= y2; i++) {
            cells.push(this.selectRow(i, table));
        }
        if (isReversed) {
            for (i = 0; i < cells.length; i++)
                cells[i].reverse();
            return cells.reverse();
        }
        else {
            return cells;
        }
    }
    selectColumn(x, table) {
        var cells = [];
        for (var y = 0; y < table.rows.length; y++) {
            var cell = table.rows[y].children[x];
            cells.push(new Cell(x, y, cell, table));
        }
        return cells;
    }
    selectSeveralColumns(x1, x2, table) {
        var i = 0;
        var isReversed = x1 > x2;
        if (isReversed) {
            [x1, x2] = [x2, x1];
        }
        var cells = [];
        for (i = x1; i <= x2; i++) {
            cells.push(this.selectColumn(i, table));
        }
        if (isReversed) {
            for (i = 0; i < cells.length; i++)
                cells[i].reverse();
            return cells.reverse();
        }
        else {
            return cells;
        }
    }
    selectMultipleCells(from, to, table) {
        var i = 0;
        var cells = [];
        if (from.y === undefined)
            from.y = 0;
        if (from.x === undefined)
            from.x = 0;
        if (to.y === undefined)
            to.y = 0;
        if (to.x === undefined)
            to.x = 0;
        // if y1 > y2 => must reverse OR if y1 == y2 AND x1 > x2 => must reverse
        var isReversed = (from.y > to.y) || (from.y === to.y && from.x > to.x);
        if (isReversed) {
            [from.x, to.x, from.y, to.y] = [to.x, from.x, to.y, from.y];
        }
        // selection
        if (from.y === to.y) {
            var row = table.rows[from.y];
            if (row) {
                if (to.x >= row.childElementCount)
                    to.x = row.childElementCount - 1;
                for (i = from.x; i <= to.x; i++) {
                    var el = row.children[i];
                    cells.push(new Cell(i, from.y, el, table));
                }
            }
            else {
                return cells;
            }
        }
        else if (from.y < to.y) {
            while (!(from.y > to.y)) {
                var row = table.rows[from.y];
                if (row) {
                    var endingPoint = to.x;
                    if (from.y === to.y) {
                        // if this is the last line,
                        // then we have to stop to x2
                        // however, if x2 >= number of cells, then we select every cell of that row again
                        if (to.x >= row.childElementCount)
                            endingPoint = row.childElementCount - 1;
                    }
                    else {
                        // if this is not the last line,
                        // then we select every cell of that row
                        endingPoint = row.childElementCount - 1;
                    }
                    for (i = from.x; i <= endingPoint; i++) {
                        var el = row.children[i];
                        cells.push(new Cell(i, from.y, el, table));
                    }
                    from.y++;
                }
                else {
                    break;
                }
            }
        }
        return isReversed ? cells.reverse() : cells;
    }
    translate(cell) {
        var row = cell.parentElement;
        var table = row.parentElement;
        if (table instanceof HTMLTableSectionElement)
            table = row.parentElement.parentElement;
        var x = 0;
        var y = 0;
        for (var td of Array.from(row.children)) {
            if (td === cell) {
                break;
            }
            x++;
        }
        for (var tr of Array.from(table.children)) {
            if (tr === row) {
                break;
            }
            y++;
        }
        return new Cell(x, y, cell, table);
    }
    isCell(cell) {
        return cell instanceof Cell;
    }
    deleteTable(table) {
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }
        table.style.display = "none";
    }
    removeColumn(x, table) {
        var cellsPerRow = this.getNumberOfCellsPerRow(table);
        for (var y = 0; y < table.rows.length; y++) {
            var numberOfCells = table.rows[y].cells.length;
            var diff = (cellsPerRow - numberOfCells);
            table.rows[y].deleteCell(x - diff);
        }
        return true;
    }
    removeRow(y, table) {
        try {
            table.deleteRow(y);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    removeCellAt(x, y, table) {
        try {
            table.rows[y].deleteCell(x);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    removeCell(cell) {
        var element = cell.getElement();
        element.parentElement.removeChild(element);
    }
    _getArgumentsFrom(name, text) {
        var regex = new RegExp('<' + name + '\((.*)\)>', 'gmi');
        text = text.replace(', ', ',');
        text.replace(regex, '$1');
        return RegExp.$1.replace(/\(|\)/gm, '').split(',');
    }
    _getColspanIdentifierFrom(text) {
        var colspan = 1;
        if (this.regexColspan.test(text) === true) {
            text.replace(this.regexColspan, '$1');
            colspan = parseInt(RegExp.$1);
        }
        return colspan;
    }
    _getRowspanIdentifierFrom(text) {
        var rowspan = 1;
        if (this.regexRowspan.test(text) === true) {
            text.replace(this.regexRowspan, '$1');
            rowspan = parseInt(RegExp.$1);
        }
        return rowspan;
    }
    _clearAllIdentifiersFrom(text) {
        text = text.replace(this.regexColspan, '');
        text = text.replace(this.regexRowspan, '');
        return text;
    }
    createCell(text, colspan = 1, rowspan = 1) {
        var cell = document.createElement('td');
        if (text[0] === "@") {
            cell = document.createElement('th');
            text = text.substring(1, text.length);
        }
        if (this.commonClass)
            cell.classList.add(this.commonClass);
        cell.setAttribute('colspan', colspan.toString());
        cell.setAttribute('rowspan', rowspan.toString());
        cell.appendChild(document.createTextNode(text));
        return cell;
    }
    addColumn(column, table, index = -1) {
        for (var y = 0; y < column.length; y++) {
            var text = column[y];
            if (text === ".")
                continue;
            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1)
                text = this._clearAllIdentifiersFrom(text);
            var newCell = this.createCell(text, colspan, rowspan);
            if (index === -1) {
                table.rows[y].appendChild(newCell);
            }
            else {
                table.rows[y].insertBefore(newCell, table.rows[y].children[index]); // if ref undefined => index=-1
            }
        }
    }
    addRow(row, table, index = -1) {
        var newRow = table.insertRow(index);
        for (var x = 0; x < row.length; x++) {
            var text = row[x];
            if (text === ".")
                continue;
            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1)
                text = this._clearAllIdentifiersFrom(text);
            var newCell = this.createCell(text, colspan, rowspan);
            newRow.appendChild(newCell);
        }
    }
    isMultipleSelector(selector) {
        return this.regexMultipleSelector.test(selector);
    }
    readMultipleSelector(selector) {
        var matches = selector.match(/(\d{1,})/g);
        var y1 = parseInt(matches[0]), x1 = parseInt(matches[1]), y2 = parseInt(matches[2]), x2 = parseInt(matches[3]);
        return {
            y1: y1,
            x1: x1,
            y2: y2,
            x2: x2
        };
    }
    readBasicSelector(selector) {
        var matches = selector.match(/(\d{1,})/g);
        var y = parseInt(matches[0]), x = parseInt(matches[1]);
        return {
            y: y,
            x: x
        };
    }
    addCustomFunction(customFunction) {
        this.customFunctions.push(customFunction);
    }
    interpretCustomFunction(text) {
        var newContent = text;
        var attributes = [];
        var events = [];
        if (this.customFunctions.length > 0) {
            for (var func of this.customFunctions) {
                var regex = new RegExp('<' + func.name + '\(.*\)>|<' + func.name + '>', 'gm');
                if (regex.test(text)) {
                    if (func.callback) {
                        var args = this._getArgumentsFrom(func.name, text);
                        newContent = func.callback(args);
                    }
                    else {
                        newContent = text.replace(regex, '');
                    }
                    if (func.attributes) {
                        for (var attr of func.attributes) {
                            attributes.push(attr);
                        }
                    }
                    if (func.events) {
                        for (var event of func.events) {
                            events.push(event);
                        }
                    }
                }
            }
        }
        return {
            newContent: newContent,
            attributes: attributes,
            events: events,
        };
    }
    getSequencesFrom(content) {
        return content.match(/\{(.*?)\}/gmi);
    }
    interpretSequences(text, table) {
        if (!table)
            throw new Error("interpretSequences(text, table): table is undefined.");
        var sequences = this.getSequencesFrom(text), sequence = '', newContent = text;
        if (!sequences)
            return text;
        for (sequence of sequences) {
            var selectors = sequence.match(this.regexSelectors);
            if (selectors) {
                for (var selector of selectors) {
                    if (!this.isMultipleSelector(selector)) {
                        var data = this.readBasicSelector(selector);
                        var cell = this.selectCell(data.x, data.y, table);
                        if (cell === undefined) {
                            throw new Error("interpretSequences(): the cell (x=" + data.x + ", y=" + data.y + ") doesn't exist.");
                        }
                        newContent = newContent.replace(selector, cell.getElement().textContent);
                    }
                    else {
                        throw new Error("interpretSequences(): cannot read a multiple selector inside a sequence.");
                    }
                }
            }
        }
        sequences = this.getSequencesFrom(newContent);
        var clothes = /\{|\}/gm;
        for (sequence of sequences) {
            var nakedSequence = sequence.replace(clothes, '');
            try {
                var evaluatedContent = eval(nakedSequence);
                newContent = newContent.replace(sequence, evaluatedContent);
            }
            catch (e) {
                console.info("Unable to evalute the content of a cell while interpreting it.");
            }
        }
        return newContent.replace(clothes, '');
    }
    read(table) {
        var y = 0, x = 0;
        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var cell = table.rows[y].cells[x];
                var result = this.interpretCustomFunction(cell.textContent);
                table.rows[y].cells[x].textContent = result.newContent;
                for (var attr of result.attributes) {
                    table.rows[y].cells[x].setAttribute(attr[0], attr[1]);
                }
                for (var event of result.events) {
                    var el = table.rows[y].cells[x];
                    el.addEventListener(event[0], event[1]);
                }
            }
        }
        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var text = table.rows[y].cells[x].textContent;
                table.rows[y].cells[x].textContent = this.interpretSequences(text, table);
            }
        }
        return table;
    }
    jsArrayToHtml(arr, title, titlePos) {
        var table = document.createElement('table');
        if (title) {
            var caption = document.createElement('caption');
            if (titlePos === "bottom") {
                caption.style.captionSide = "bottom";
            }
            caption.appendChild(document.createTextNode(title));
            table.appendChild(caption);
        }
        table.classList.add("generated-jstable");
        for (var y = 0; y < arr.length; y++) {
            this.addRow(arr[y], table, -1);
        }
        return this.read(table);
    }
    htmlTableToJS(table) {
        var array = [];
        var rows = table.rows;
        for (var y = 0; y < rows.length; y++) {
            array[y] = [];
            for (var x = 0; x < rows[y].children.length; x++) {
                var el = rows[y].children[x];
                array[y][x] = new Cell(x, y, el, table);
            }
        }
        return array;
    }
    htmlTableToString(table) {
        var array = [];
        var rows = table.rows;
        var cellsPerRow = this.getNumberOfCellsPerRow(table);
        for (var y = 0; y < rows.length; y++) {
            array[y] = [];
            for (var x = 0; x < cellsPerRow; x++) {
                var cell = rows[y].children[x];
                if (cell === undefined) {
                    continue;
                }
                else {
                    var content = cell.textContent;
                    var rowspan = parseInt(cell.getAttribute("rowspan"));
                    var colspan = parseInt(cell.getAttribute("colspan"));
                    if (rowspan > 1)
                        content += ".c*" + rowspan;
                    if (colspan > 1)
                        content += ".r*" + colspan;
                    array[y][x] = content;
                }
            }
        }
        return array;
    }
    generate(table, container = document.body) {
        container.appendChild(table);
    }
}
