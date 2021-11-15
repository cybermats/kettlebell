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
    this.toggle = toggle;
};

var Workout = function (elem, ontoggle) {
    // General variables
    var workout = elem;
    var workoutId = workout.id;
    var ul = workout.querySelector("ul.workout-sets");
    var sets = localStorage.getItem(workoutId);

    // Create initial checkboxes
    if (sets) {
        if (ul) {
            for (var i = 0; i < sets; i++) {
                var li = createCheckbox(workoutId, i);
                ul.appendChild(li);
            }
        }
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

    function onclickAddSet(event) {
        if (ul) {
            var lis = ul.querySelectorAll("li");
            var li = createCheckbox(lis.length);
            ul.appendChild(li);
            localStorage.setItem(workoutId, lis.length + 1);
        }
    }

    // Handle Remove Set
    var removeSetButton = workout.querySelector(".workout-remove-set");
    if (removeSetButton) {
        removeSetButton.addEventListener("click", onclickRemoveSet);
    }

    function onclickRemoveSet(event) {
        if (ul) {
            var lis = ul.querySelectorAll("li");
            var li = lis.item(lis.length - 1);
            ul.removeChild(li);
            localStorage.setItem(workout.id, lis.length - 1);
        }
    }

    // Handle Timer Toggle
    var toggleButton = workout.querySelector(".workout-toggle");
    toggleButton.addEventListener("click", onclickToggleTimer);

    function onclickToggleTimer(event) {
        timer.toggle();
        toggleEvent();
    }
    /*
        // Handle Reset
        var resetButton = workout.querySelector(".workout-reset");
        resetButton.addEventListener("click", onclickReset);
    
        function onclickReset(event) {
            timer.stop();
            timer.reset();
            var checkboxes = workout.querySelectorAll(".workout-set");
            for (var i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }
    
            toggleEvent();
        }
    */
    // Handle Checkbox Toggle
    function onclickCheckbox(event) {
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
            ontoggle(timer.running());
        }
    }
}


function init() {
    if (!localStorage.getItem("warmup")) {
        localStorage.setItem("warmup", 3);
    }
    if (!localStorage.getItem("swing")) {
        localStorage.setItem("swing", 5);
    }
    if (!localStorage.getItem("getup")) {
        localStorage.setItem("getup", 5);
    }

    var elems = document.getElementsByClassName("workout");
    for (var i = 0; i < elems.length; i++) {
        new Workout(elems[i]);
    };
};

window.addEventListener("load", init);

