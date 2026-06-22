let currentCellActivity = null;
let currentCellDate = null;

let data = JSON.parse(
  localStorage.getItem("tracker")
) || {
  dates: [],
  activities: []
};

function saveData() {
  localStorage.setItem(
    "tracker",
    JSON.stringify(data)
  );
}

function celebrate() {

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.7 }
  });

}

function getTodayDate() {

  const d = new Date();

  return d.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short"
    }
  ).replace(" ", "-");
}

/* AUTO CREATE TODAY */

if (!data.dates.includes(getTodayDate())) {

  data.dates.push(getTodayDate());

  data.activities.forEach(activity => {

    activity.statuses[getTodayDate()] = {
      status: "",
      feedback: ""
    };

  });

  saveData();
}

/* ADD ACTIVITY */

function addActivity() {

  const name = prompt(
    "Enter Activity Name"
  );

  if (!name) return;

  const statuses = {};

  data.dates.forEach(date => {

    statuses[date] = {
      status: "",
      feedback: ""
    };

  });

  data.activities.push({
    name,
    statuses
  });

  saveData();
  renderTable();
}

/* ADD DATE */

function addDate() {

  const date = prompt(
    "Enter Date (e.g. 22-Jun)"
  );

  if (!date) return;

  if (data.dates.includes(date)) {

    alert(
      "Date already exists"
    );

    return;
  }

  data.dates.push(date);

  data.activities.forEach(activity => {

    activity.statuses[date] = {
      status: "",
      feedback: ""
    };

  });

  saveData();
  renderTable();
}

/* TOGGLE STATUS */

function toggleStatus(
  index,
  date
) {

  const cell =
    data.activities[index]
      .statuses[date];

  let current =
    cell.status;

  let next = "";

  if (current === "") {

    next = "✓";

    celebrate();

  }
  else if (current === "✓") {

    next = "✗";

  }
  else {

    next = "";

  }

  cell.status = next;

  saveData();
  renderTable();
}

/* TABLE */

function renderTable() {

  const table =
    document.getElementById(
      "trackerTable"
    );

  let html = `
  <tr>
    <th>Activities</th>
  `;

  data.dates.forEach(date => {

    html += `
    <th
      oncontextmenu="
      showDateMenu(
      event,
      '${date}'
      )"
    >
      ${date}
    </th>
    `;

  });

  html += `
    <th>
      Progress
    </th>
  </tr>
  `;

  data.activities.forEach(
    (activity, index) => {

      html += `
      <tr>

      <td
      class="activity-name"
      oncontextmenu="
      showActivityMenu(
      event,
      ${index}
      )"
      >
      ${activity.name}
      </td>
      `;

      let completed = 0;

      data.dates.forEach(date => {

        const cell =
          activity.statuses[date];

        const value =
          cell.status;

        const feedback =
          cell.feedback;

        if (value === "✓")
          completed++;

        let cls = "empty";

        if (value === "✓")
          cls = "tick";

        if (value === "✗")
          cls = "cross";

        html += `
        <td

        class="
        status-cell
        ${cls}
        "

        onclick="
        toggleStatus(
        ${index},
        '${date}'
        )
        "

        oncontextmenu="
        showCellMenu(
        event,
        ${index},
        '${date}'
        )
        "
        >

        ${value}
        ${feedback ? " 💬" : ""}

        </td>
        `;

      });

      const percent =
        data.dates.length
          ?
          Math.round(
            completed /
            data.dates.length
            * 100
          )
          : 0;

      html += `
      <td>

      <div
      class="
      activity-progress
      ">

      <div
      class="
      small-bar
      ">

      <div
      class="
      small-fill
      "

      style="
      width:${percent}%
      ">
      </div>

      </div>

      <small>
      ${percent}%
      </small>

      </div>

      </td>

      </tr>
      `;

    });

  table.innerHTML = html;

  updateStats();
}

/* FEEDBACK */

function showCellMenu(
  event,
  activityIndex,
  date
) {

  event.preventDefault();

  currentCellActivity =
    activityIndex;

  currentCellDate =
    date;

  menu.innerHTML = `

  <div
  onclick="
  openFeedback()
  ">
  💬 Add Feedback
  </div>

  <div
  onclick="
  viewFeedback()
  ">
  👀 View Feedback
  </div>

  `;

  menu.style.display =
    "block";

  menu.style.left =
    event.pageX + "px";

  menu.style.top =
    event.pageY + "px";
}

function openFeedback() {

  hideMenu();

  const modal =
    document.getElementById(
      "feedbackModal"
    );

  modal.style.display =
    "flex";

  const cell =
    data.activities[
      currentCellActivity
    ].statuses[
      currentCellDate
    ];

  document.getElementById(
    "feedbackInput"
  ).value =
    cell.feedback || "";
}

function closeFeedbackModal() {

  document.getElementById(
    "feedbackModal"
  ).style.display =
    "none";
}

function viewFeedback() {

  const feedback =
    data.activities[
      currentCellActivity
    ]
      .statuses[
      currentCellDate
    ]
      .feedback;

  alert(
    feedback ||
    "No feedback available"
  );
}

/* STATS */

function updateStats() {

  let total = 0;
  let completed = 0;

  let bestName = "-";
  let bestPercent = 0;

  data.activities.forEach(
    activity => {

      let activityDone = 0;

      data.dates.forEach(
        date => {

          total++;

          if (
            activity.statuses[date]
            &&
            activity.statuses[date].status === "✓"
          ) {

            completed++;
            activityDone++;

          }

        }
      );

      const percent =
        data.dates.length
          ?
          Math.round(
            activityDone /
            data.dates.length
            * 100
          )
          : 0;

      if (
        percent > bestPercent
      ) {

        bestPercent = percent;
        bestName = activity.name;

      }

    }
  );

  const completionRate =
    total
      ?
      Math.round(
        completed /
        total
        * 100
      )
      : 0;

  document.getElementById(
    "completionRate"
  ).innerText =
    completionRate + "%";

  document.getElementById(
    "bestActivity"
  ).innerText =
    bestName;

  document.getElementById(
    "overallBar"
  ).style.width =
    completionRate + "%";

  const percentText =
    document.getElementById(
      "overallPercent"
    );

  if (percentText) {

    percentText.innerText =
      completionRate + "%";

  }

  /* STRICT STREAK */

  let streak = 0;

  for (
    let i =
    data.dates.length - 1;
    i >= 0;
    i--
  ) {

    let allDone = true;

    data.activities.forEach(
      activity => {

        if (
          !activity.statuses[
            data.dates[i]
          ]
          ||
          activity.statuses[
            data.dates[i]
          ].status !== "✓"
        ) {

          allDone = false;

        }

      }
    );

    if (allDone)
      streak++;

    else
      break;
  }

  document.getElementById(
    "streak"
  ).innerText =
    streak + " Days";
}

/* SAVE FEEDBACK */

window.addEventListener(
  "load",
  () => {

    const btn =
      document.getElementById(
        "saveFeedback"
      );

    if (btn) {

      btn.addEventListener(
        "click",
        () => {

          const value =
            document.getElementById(
              "feedbackInput"
            ).value;

          data.activities[
            currentCellActivity
          ]
            .statuses[
            currentCellDate
          ]
            .feedback =
            value;

          saveData();

          closeFeedbackModal();

          renderTable();

        }
      );

    }

  }
);

/* CONTEXT MENU */

const menu =
  document.getElementById(
    "contextMenu"
  );

function hideMenu() {

  menu.style.display =
    "none";
}

document.addEventListener(
  "click",
  hideMenu
);

/* ACTIVITY MENU */

function showActivityMenu(
  event,
  index
) {

  event.preventDefault();

  menu.innerHTML = `

  <div
  onclick="
  editActivity(
  ${index}
  )">
  ✏️ Edit Activity
  </div>

  <div
  onclick="
  deleteActivity(
  ${index}
  )">
  🗑 Delete Activity
  </div>

  `;

  menu.style.display =
    "block";

  menu.style.left =
    event.pageX + "px";

  menu.style.top =
    event.pageY + "px";
}

/* DATE MENU */

function showDateMenu(
  event,
  date
) {

  event.preventDefault();

  menu.innerHTML = `

  <div
  onclick="
  renameDate(
  '${date}'
  )">
  ✏️ Rename Date
  </div>

  <div
  onclick="
  deleteDate(
  '${date}'
  )">
  🗑 Delete Date
  </div>

  `;

  menu.style.display =
    "block";

  menu.style.left =
    event.pageX + "px";

  menu.style.top =
    event.pageY + "px";
}

/* EDIT ACTIVITY */

function editActivity(
  index
) {

  const newName =
    prompt(
      "Edit Activity",
      data.activities[
        index
      ].name
    );

  if (!newName)
    return;

  data.activities[
    index
  ].name =
    newName;

  saveData();

  renderTable();
}

/* DELETE ACTIVITY */

function deleteActivity(
  index
) {

  if (
    confirm(
      "Delete Activity?"
    )
  ) {

    data.activities
      .splice(
        index,
        1
      );

    saveData();

    renderTable();
  }
}

/* RENAME DATE */

function renameDate(
  date
) {

  const newDate =
    prompt(
      "Rename Date",
      date
    );

  if (!newDate)
    return;

  data.dates =
    data.dates.map(
      d =>
        d === date
          ? newDate
          : d
    );

  data.activities
    .forEach(
      activity => {

        activity.statuses[
          newDate
        ] =
          activity.statuses[
          date
          ];

        delete activity
          .statuses[
          date
          ];

      }
    );

  saveData();

  renderTable();
}

/* DELETE DATE */

function deleteDate(
  date
) {

  if (
    confirm(
      "Delete Date?"
    )
  ) {

    data.dates =
      data.dates.filter(
        d =>
          d !== date
      );

    data.activities
      .forEach(
        activity => {

          delete activity
            .statuses[
            date
            ];

        }
      );

    saveData();

    renderTable();
  }
}

/* FLOATING BUTTON */

const fab =
  document.getElementById(
    "fab"
  );

const fabMenu =
  document.getElementById(
    "fabMenu"
  );

if (
  fab &&
  fabMenu
) {

  fab.addEventListener(
    "click",
    () => {

      if (
        fabMenu.style.display
        === "flex"
      ) {

        fabMenu.style.display =
          "none";

      }
      else {

        fabMenu.style.display =
          "flex";

      }

    }
  );

}

/* QUOTES */

const quotes = [

  "Discipline beats motivation.",

  "Progress over perfection.",

  "Small wins every day.",

  "Stay consistent.",

  "One task at a time.",

  "Success is built daily.",

  "Don't break the streak.",

  "Future you will thank you."

];

const quote =
  document.getElementById(
    "quoteText"
  );

if (quote) {

  quote.innerText =
    quotes[
      Math.floor(
        Math.random()
        *
        quotes.length
      )
    ];

}

/* INITIAL RENDER */

renderTable();