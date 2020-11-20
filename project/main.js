var mine = null;
var timeHandle = null;
window.onload = function () {
    var radios = document.getElementsByName("level");
    for (var i = 0, j = radios.length; i < j; i++) {
        radios[i].onclick = function () {
            if (mine != null)
                if (mine.mineCountElement > 0)
                    if (!confirm("end？"))
                        return false;
            var value = this.value;
            findBegin(value, value);
            document.getElementById("main").style.width = value * 40 + 180 + 60 + "px";
        }
    }
    findBegin(10, 10);
};

function findBegin(row, col) {
    var countElement = document.getElementById("mineCount");
    var timeShow = document.getElementById("costTime");
    var beginButton = document.getElementById("begin");
    if (mine != null) {
        clearInterval(timeHandle);
        timeShow.innerHTML = 0;
        countElement.innerHTML = 0;
    }
    
    mine = new Mine("landMine", row, col); 
    // set the callback function
    mine.endCallBack = function () {
        clearInterval(timeHandle);
    };

    mine.LandMineCallBack = function (m) {
        countElement.innerHTML = m;
    };

    //Binding event for Button "Start Game"
    beginButton.onclick = function () {
        mine.run();//Initialization

        //Show surplus number of mines
        countElement.innerHTML = mine.mineCount;

        mine.begin();

        //Updating spent time
        timeHandle = setInterval(function () {
            timeShow.innerHTML = parseInt((new Date() - mine.beginTime) / 1000);
        }, 1000);
    };
}