function millisToString(millis) {
    var date = new Date(0);
    date.setMilliseconds(millis);
    return date.toISOString().substr(14, 7);
}

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

    function toggle() {
        if (interval) {
            stop();
        } else {
            start();
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
        elem.innerHTML = millisToString(clock);
    }

    function delta() {
        var now = Date.now(),
            d = now - offset;

        offset = now;
        return d;
    }

    function value() {
        return clock;
    }

    this.start = start;
    this.stop = stop;
    this.reset = reset;
    this.running = running;
    this.toggle = toggle;
    this.value = value;
};

var Workout = function (elem, ontoggle) {
    // General variables
    var workout = elem;
    var workoutId = workout.id;
    var ul = workout.querySelector("ul.workout-sets");
    var config = JSON.parse(localStorage.getItem(workoutId));

    // Create initial checkboxes
    if (config && config.sets) {
        if (ul) {
            for (var i = 0; i < config.sets; i++) {
                var li = createCheckbox(workoutId, i);
                ul.appendChild(li);
            }
        }
        updateSavedDuration();
    }

    // Create timer
    var timer = new Stopwatch(workout.querySelector(".workout-duration"), {
        delay: 100
    });


    // Handle Add Set
    var addSetButton = workout.querySelector(".workout-add-set");
    if (addSetButton) {
        addSetButton.addEventListener("click", onclickAddSet);
    }

    function onclickAddSet() {
        if (ul) {
            var lis = ul.querySelectorAll("li");
            var li = createCheckbox(lis.length);
            ul.appendChild(li);
            store("sets", lis.length + 1);
            onclickCheckbox();
        }
    }

    // Handle Remove Set
    var removeSetButton = workout.querySelector(".workout-remove-set");
    if (removeSetButton) {
        removeSetButton.addEventListener("click", onclickRemoveSet);
    }

    function onclickRemoveSet() {
        if (ul) {
            var lis = ul.querySelectorAll("li");
            var li = lis.item(lis.length - 1);
            ul.removeChild(li);
            store("sets", lis.length - 1);
            onclickCheckbox();
        }
    }

    // Handle Timer Toggle
    var toggleButton = workout.querySelector(".workout-toggle");
    if (toggleButton) {
        toggleButton.addEventListener("click", onclickToggleTimer);
    }

    function onclickToggleTimer() {
        timer.toggle();
        toggleEvent();
    }

    // Handle Checkbox Toggle
    function onclickCheckbox() {
        var checkboxes = workout.querySelectorAll(".workout-set");
        var checked = 0;
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checked++;
            }
        }
        if (checked == checkboxes.length) {
            timer.stop();
        } else if (checked == 0) {
            timer.stop();
        } else {
            timer.start();
        }
        toggleEvent();
    }

    // Helper functions
    function createCheckbox(setCount) {
        var setId = workoutId + "-" + setCount;
        var input = document.createElement("input");
        input.type = "checkbox";
        input.className = "workout-set"
        input.name = setId;
        input.id = setId;
        input.addEventListener("click", onclickCheckbox);

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

    function toggleEvent() {
        if (timer.running()) {
            toggleButton.innerHTML = toggleButton.getAttribute("workout-running");
        } else {
            toggleButton.innerHTML = toggleButton.getAttribute("workout-idle");
        }
        if (ontoggle) {
            ontoggle();
        }
    }

    function updateSavedDuration() {
        var c = JSON.parse(localStorage.getItem(workoutId));
        if (c && c.duration) {
            workout.querySelector(".workout-duration-old").innerHTML = millisToString(c.duration);
        }
    }

    function store(key, value) {
        var data = JSON.parse(localStorage.getItem(workoutId));
        data[key] = value;
        localStorage.setItem(workoutId, JSON.stringify(data));
    }

    function running() {
        return timer.running();
    }

    function save() {
        store("duration", timer.value());
    }

    function reset() {
        timer.stop();
        timer.reset();
        toggleEvent();
    }

    this.running = running;
    this.save = save;
    this.reset = reset;
}


function init() {

    if (!localStorage.getItem("warmup")) {
        localStorage.setItem("warmup", JSON.stringify({ "sets": 3, "duration": 0 }));
    }
    if (!localStorage.getItem("swing")) {
        localStorage.setItem("swing", JSON.stringify({ "sets": 5, "duration": 0 }));
    }
    if (!localStorage.getItem("getup")) {
        localStorage.setItem("getup", JSON.stringify({ "sets": 5, "duration": 0 }));
    }

    var elems = document.getElementsByClassName("workout");

    // Create timer
    var overviewTimer = new Stopwatch(document.querySelector("#overview .workout-duration"), {
        delay: 100
    });

    var tasks = [];
    function callback() {
        var stopped = true;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].running()) {
                stopped = false;
                break;
            }
        }
        if (stopped) {
            overviewTimer.stop();
        } else {
            overviewTimer.start();
        }
    }

    for (var i = 0; i < elems.length; i++) {
        tasks.push(new Workout(elems[i], callback));
    };

    var resetButton = document.querySelector(".workout-reset");
    resetButton.addEventListener("click", onclickReset);

    function onclickReset(event) {
        var checkboxes = document.querySelectorAll(".workout-set");
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = false;
        }
        for (var i = 0; i < tasks.length; i++) {
            tasks[i].reset();
        }
        overviewTimer.stop();
        overviewTimer.reset();
    }

    var saveButton = document.querySelector(".workout-save");
    saveButton.addEventListener("click", onclickSave);

    function onclickSave(event) {
        for (var i = 0; i < tasks.length; i++) {
            tasks[i].save();
        }

    }
};

window.addEventListener("load", init);
