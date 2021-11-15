var Stopwatch = function (elem, options) {
    var offset, clock, interval;
    var options = options || {};
    options.delay = options.delay || 100;

    reset();

    function start() {
        if (!interval) {
            offset = Date.now();
            interval = setInterval(update, options.delay);
        }
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    function reset() {
        clock = 0;
        render();
    }

    function running() {
        return !!interval;
    }

    function update() {
        clock += delta();
        render();
    }

    function render() {
        var date = new Date(0);
        date.setMilliseconds(clock);
        elem.innerHTML = date.toISOString().substr(14, 7);
    }

    function delta() {
        var now = Date.now(),
            d = now - offset;

        offset = now;
        return d;
    }

    this.start = start;
    this.stop = stop;
    this.reset = reset;
    this.running = running;
};

var timers = {};


function onclickToggleTimer(event) {
    var workout = event.target.closest(".workout");
    var timer = timers[workout.id];
    if (timer.running()) {
        timer.stop();
    } else {
        timer.start();
    }
    updateToggleButton(workout);
}

function updateToggleButton(workout_elem) {
    var button = workout_elem.querySelector(".toggle-counter");
    if (timers[workout_elem.id].running()) {
        button.innerHTML = "Done";
    } else {
        button.innerHTML = "Start";
    }
}

function onclickStart(event) {
    var workout = event.target.closest(".workout");
    var timer = timers[workout.id];
    timer.start();
}

function onclickDone(event) {
    var workout = event.target.closest(".workout");
    var timer = timers[workout.id];
    timer.stop();
}

function onclickReset(event) {
    var workout = event.target.closest(".workout");
    var timer = timers[workout.id];
    timer.stop();
    timer.reset();
    var checkboxes = workout.querySelectorAll(".workout-set-list-item > input");
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
    updateToggleButton(workout);
}

function onclickAddSet(event) {
    var workout = event.target.closest(".workout");
    var ul = workout.querySelector("ul.workout-sets");
    if (ul) {
        var lis = ul.getElementsByTagName("li");
        var li = createCheckbox(workout.id, lis.length);
        ul.appendChild(li);
        localStorage.setItem(workout.id, lis.length);
    }
    onCheckboxClick(event);
}

function onclickRemoveSet(event) {
    var workout = event.target.closest(".workout");
    var uls = workout.getElementsByClassName("workout-sets");
    if (uls.length > 0) {
        var ul = uls[0];
        var lis = ul.getElementsByTagName("li");
        var li = lis.item(lis.length - 1);
        ul.removeChild(li);
        localStorage.setItem(workout.id, lis.length);
    }
    onCheckboxClick(event);
}

function onCheckboxClick(event) {
    var workout = event.target.closest(".workout");
    var checkboxes = workout.getElementsByTagName("input");
    var checked = 0;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checked++;
        }
    }
    var workout = event.target.closest(".workout");
    var timer = timers[workout.id];

    if (checked == checkboxes.length) {
        timer.stop();
    } else if (checked == 0) {
        timer.stop();
    } else {
        timer.start();
    }
    updateToggleButton(workout);

    return checked == checkboxes.length;
}

function createCheckbox(workoutId, setCount) {
    var setId = workoutId + "-" + setCount;
    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "workout-set"
    input.name = setId;
    input.id = setId;
    input.addEventListener("click", onCheckboxClick);

    var label = document.createElement("label");
    label.className = "workout-set-button"
    label.htmlFor = setId;
    label.setAttribute("workout-set-name", setCount + 1);

    var li = document.createElement("li");
    li.className = "workout-set-list-item"
    li.appendChild(input);
    li.appendChild(label);
    return li;
}

function initializeCheckboxes(id, itemsToAdd) {
    var div = document.getElementById(id);
    var uls = div.getElementsByClassName("workout-sets");
    if (uls.length > 0) {
        var ul = uls[0];
        for (var i = 0; i < itemsToAdd; i++) {
            var li = createCheckbox(id, i);
            ul.appendChild(li);
        }
    }
}

function init() {
    var swings = localStorage.getItem("swing");
    if (!swings) {
        swings = 5;
        localStorage.setItem("swing", swings);
    }
    var getups = localStorage.getItem("getup");
    if (!getups) {
        getups = 5;
        localStorage.setItem("getup", getups);
    }
    initializeCheckboxes("swing", swings);
    initializeCheckboxes("getup", getups);

    var elems = document.getElementsByClassName("workout");
    for (var i = 0; i < elems.length; i++) {
        timers[elems[i].id] = new Stopwatch(elems[i].querySelector(".duration"));
    };
};

window.addEventListener("load", init);

