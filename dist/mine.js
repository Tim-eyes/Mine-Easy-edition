class Mine{
    constructor(id, row, col){
        if(!(this instanceof Mine)){
            return new Mine(id, row, col);
        }
        this.doc = document;
        this.row = row || 10;
        this.col = col || 10;
        this.mineCount = this.row * this.col / 5;
        this.markMineCount = 0;//marked number of mine
        this.arr = [];
        this.beginTime = null;//beginning time
        this.endTime = null;//ending time
        this.stepCount = 0;//current steps   
        this.table = this.doc.getElementById(id);//table for calls
        this.endCallBack = null;//callback function at the end of the game
        this.LandMineCallBack = null;
        //callback function to update the number of remaining mines when marked as mines
        this.doc.oncontextmenu = function(){
            return false;
        };

        this.draw();
    }

    getId(id){
        return document.getElementById(id);
    }
    
    draw() {
        var tdArr = [];//Record the <td> with id of all cells
        if (window.ActiveXObject && parseInt(navigator.userAgent.match(/msie ([\d.]+)/i)[1]) < 8) {
            var css = '#main table td{background-color:#888;}',
                head = this.doc.getElementsByTagName("head")[0],
                style = this.doc.createElement("style");
            style.type = "text/css";
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(this.doc.createTextNode(css));
            }
            head.appendChild(style);
        }
        for (var i = 0; i < this.row; i++) {
            tdArr.push("<tr>");
            for (var j = 0; j < this.col; j++) {
                tdArr.push("<td id='" + i + " " + j + "'></td>");
            }
            tdArr.push("</td>");
        }
        this.setTableInnerHTML(this.table, tdArr.join(""));
    }

    //Add HTML to Table
    setTableInnerHTML(table, html) {
        if (navigator && navigator.userAgent.match(/msie/i)) {
            var temp = table.ownerDocument.createElement('div');
            temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
            if (table.tBodies.length == 0) {
                var tbody = document.createElement("tbody");
                table.appendChild(tbody);
            }
            table.replaceChild(temp.firstChild.firstChild, table.tBodies[0]);
        } else {
            table.innerHTML = html;
        }
    }

    init() {
        for (var i = 0; i < this.row; i++) {
            this.arr[i] = [];
            for (var j = 0; j < this.col; j++) {
                this.arr[i][j] = 0;
            }
        }
        this.mineCount = this.row * this.col / 5;
        this.markMineCount = 0;
        this.beginTime = null;
        this.endTime = null;
        this.stepsCount= 0;
    }

    //Set the value of the array item that is mine to 9
    landMine() {
        var allCount = this.row * this.col;
        var tempArr = [];
        for (var i = 0; i < this.mineCount; i++) {
            var randomNum =  Math.floor(Math.random()*allCount)+1;
            var Row = this.getRow(randomNum);
            var Col = this.getCol(randomNum);
            if (randomNum in tempArr) {
                i--;
                continue;
            }
            if(Row != 0 && Col != 0){
                this.arr[Row][Col] = 9;
            }
            
            tempArr[randomNum] = randomNum;
        }
    }

    //get the corresponding row or column by value
    getRow(val) {
        var row = parseInt(val / this.col);
        return row;
    }

    getCol(val){
        var col = val % this.col;
        return col;
    }

    //Calculate the numbers in other cells
    calculateMineCount() {
        var dir=[0,1,-1];
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                if (this.arr[i][j] == 9)
                    continue;
                for(var m = 0; m < 3; m++){
                    for(var n = 0; n < 3; n++){
                        if(i + dir[m] >= 1 && j + dir[n] >=1
                            && i + dir[m] <= this.row - 1 && j + dir[n] <= this.col-1
                            && !(dir[m] == 0 && dir[n] == 0)
                            && this.arr[i + dir[m]][j + dir[n]] != -1){
                                if(this.arr[i + dir[m]][j + dir[n]] == 9){
                                    this.arr[i][j]++;
                                }
                        }
                        
                    }
                }
            }
        }
    }
    
    //Bind click events (left and right) to each cell
    bindCells() {
        var self = this;
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                (function (row, col) {
                    self.getId( i + " " + j).onmousedown = function (e) {
                        e = e || window.event;
                        var mouseNum = e.button;
                        var className = this.className;
                        if (mouseNum == 2) {
                            if (className == "flag") {
                                this.className = "question";
                                self.markMineCount--;
                            } 
                            else if(className == "question"){
                                this.className = "";
                            } 
                            else {
                                this.className = "flag";
                                self.markMineCount++;
                            }
                            if (self.LandMineCallBack) {
                                self.LandMineCallBack(self.mineCount - self.markMineCount);
                            }
                        } else if (className != "flag" && className != "question") {
                            self.openBlock.call(self, this, row, col);
                        }
                    };
                })(i,j);
            }
        }
    }

   
    //display
    openBlock(obj, x, y) {
        if (this.arr[x][y] != 9) {
            this.stepsCount++;
            if (this.arr[x][y] != 0) {
                obj.innerHTML = this.arr[x][y];
            }
            obj.className = "normal";
            if (this.stepsCount + this.mineCount == this.row * this.col) {
                this.success();
            }
            obj.onmousedown = null;
            if (this.arr[x][y] == 0) {
                this.showNoMine.call(this, x, y);
            }
        } else {
            this.failed();
        }
    }

     //show no-mine-areas
     showNoMine(x, y) {
        for (var i = x - 1; i < x + 2; i++)
            for (var j = y - 1; j < y + 2; j++) {
                if (!(i == x && j == y)) {
                    var ele = this.getId( i + " " + j);
                    if (ele && ele.className == "") {
                        this.openBlock.call(this, ele, i, j);
                    }
                }
            }
    }
    //show mine-areas
    showMine(){
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                if (this.arr[i][j] == 9) {
                    this.getId( i + " " + j).className = "landMine";
                }
            }
        }
    }

    //show all areas
    showAll() {
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                if (this.arr[i][j] == 9) {
                    this.getId( i + " " + j).className = "landMine";
                } else {
                    var ele=this.getId( i + " " + j);
                    if (this.arr[i][j] != 0)
                        ele.innerHTML = this.arr[i][j];
                    ele.className = "normal";
                }
            }
        }
    }

    //Hide all information of cells
    hideAll() {
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var tdCell = this.getId( i + " " + j);
                tdCell.className = "";
                tdCell.innerHTML = "";
            }
        }
    }

    //Delete binding event of cells
    deleteALL(){
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var tdCell = this.getId( i + " " + j);
                tdCell.onmousedown = null;
            }
        }
    }
   
    begin(){
        this.stepsCount = 0;//number of steps clearing
        this.markMineCount = 0;
        this.beginTime = new Date();//beginning time
        this.hideAll();
        this.bindCells();
    }

    end(){
        this.endTime = new Date();//ending time
        if (this.endCallBack) {//Call if there is a callback function
            this.endCallBack();
        }
    }
    

    success(){
        this.end();
        this.showAll();
        this.deleteALL();
        alert("YOU WIN!！");
    }


    failed(){
        this.end();
        this.showAll();
        this.deleteALL();
        alert("GAME OVER!！");
    }
   

    
    run(){
        this.init();
        this.landMine();
        this.calculateMineCount();
    }
}    