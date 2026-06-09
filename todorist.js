/* ========================================
   HTML要素の取得
======================================== */

/*
  課題追加フォームの入力欄を取得する
  ユーザーが入力した値は、ここから取り出す
*/
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const assigneeInput = document.getElementById("assigneeInput");
const deadlineInput = document.getElementById("deadlineInput");

/*
  課題追加ボタンとエラーメッセージ表示場所
*/
const addBtn = document.getElementById("addBtn");
const errorMessage = document.getElementById("errorMessage");

/*
  カレンダー表示に使うHTML要素
*/
const calendarTableArea = document.getElementById("calendarTableArea");
const monthTitle = document.getElementById("monthTitle");

/*
  月移動用ボタン
*/
const prevBtn = document.getElementById("prevBtn");
const todayBtn = document.getElementById("todayBtn");
const nextBtn = document.getElementById("nextBtn");

/*
  右側に表示するタスク詳細パネル
*/
const taskDetail = document.getElementById("taskDetail");

/*
  編集モーダル用のHTML要素
*/
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");


/* ========================================
   データ管理
======================================== */

/*
  localStorageから保存済みのタスク一覧を読み込む

  localStorageに保存されているデータは文字列なので、
  JSON.parseでJavaScriptの配列に戻す

  まだ何も保存されていない場合は null になるため、
  || [] で空配列を入れる
*/
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/*
  現在表示しているカレンダーの年月

  初期値は今日の日付
  前月・翌月ボタンを押すと、この値を変更して再描画する
*/
let viewDate = new Date();


/* ========================================
   共通関数
======================================== */

/*
  tasks配列をlocalStorageに保存する関数

  localStorageには配列やオブジェクトをそのまま保存できないため、
  JSON.stringifyで文字列に変換して保存する
*/
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/*
  今日の日付を YYYY-MM-DD 形式で取得する関数

  例：
  2026-06-09

  カレンダーの日付や締切日と比較しやすくするため、
  input type="date" と同じ形式にしている
*/
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

/*
  編集モーダルを閉じる関数

  hiddenクラスを追加することで、
  CSS側で display: none; が適用される
*/
function closeModal() {
  modalOverlay.classList.add("hidden");
}

/*
  モーダルの黒い背景部分をクリックしたら閉じる

  event.target === modalOverlay の意味：
  クリックされた場所がモーダル背景そのものだった場合だけ閉じる

  これにより、白い編集フォーム部分をクリックしても閉じない
*/
modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});


/* ========================================
   タスク詳細表示
======================================== */

/*
  選択されたタスクの詳細を右側パネルに表示する関数

  表示する内容：
  ・タスク名
  ・詳細
  ・担当者
  ・追加日
  ・締切日
  ・完了状態

  さらに、
  ・完了切替ボタン
  ・編集ボタン
  ・削除ボタン

  もここで作成している
*/
function renderTaskDetail(task) {
  /*
    右側パネルの中身を一度空にする

    これをしないと、前に表示していたタスク情報が残ったまま
    新しい情報が下に追加されてしまう
  */
  taskDetail.innerHTML = "";

  /*
    タスク名を表示するh3要素を作成
  */
  const title = document.createElement("h3");
  title.textContent = task.title;

  /*
    詳細文を表示

    詳細が空文字の場合は「詳細：なし」と表示する
  */
  const description = document.createElement("p");
  description.textContent =
    task.description === "" ? "詳細：なし" : "詳細：" + task.description;

  /*
    担当者を表示

    担当者が未入力の場合は「未設定」と表示する
  */
  const assignee = document.createElement("p");
  assignee.textContent =
    !task.assignee ? "担当者：未設定" : "担当者：" + task.assignee;

  /*
    タスクを追加した日を表示
  */
  const createdAt = document.createElement("p");
  createdAt.textContent = "追加日：" + task.createdAt;

  /*
    締切日を表示
  */
  const deadline = document.createElement("p");
  deadline.textContent = "締切日：" + task.deadline;

  /*
    完了状態を表示

    completedがtrueなら完了
    falseなら未完了
  */
  const status = document.createElement("p");
  status.textContent = task.completed ? "状態：完了" : "状態：未完了";

  /*
    完了・未完了を切り替えるボタンを作成
  */
  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.completed ? "未完了に戻す" : "完了にする";

  /*
    完了切替ボタンを押した時の処理

    task.completed = !task.completed;

    の意味：
    trueならfalseへ
    falseならtrueへ
    反転させる
  */
  completeBtn.addEventListener("click", function () {
    task.completed = !task.completed;

    /*
      状態を変更したら保存する
      これをしないとページ更新時に元に戻ってしまう
    */
    saveTasks();

    /*
      カレンダー上のタスクバーの色も変えるため、
      カレンダーを再描画する
    */
    renderCalendar();

    /*
      右側パネルの状態表示やボタン文字も更新するため、
      詳細パネルも再描画する
    */
    renderTaskDetail(task);
  });

  /*
    編集ボタンを作成
  */
  const editBtn = document.createElement("button");
  editBtn.textContent = "編集";

  /*
    編集ボタンを押したら編集モーダルを表示する
  */
  editBtn.addEventListener("click", function () {
    renderEditForm(task);
  });

  /*
    削除ボタンを作成
  */
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";

  /*
    削除ボタンを押した時の処理
  */
  deleteBtn.addEventListener("click", function () {
    /*
      confirmで確認ダイアログを出す

      OKなら true
      キャンセルなら false
    */
    const ok = confirm("この課題を削除しますか？");

    /*
      キャンセルされたらここで処理を終了
    */
    if (!ok) return;

    /*
      削除対象以外のタスクだけを残す

      task.id と一致しないものだけを残すことで、
      選択中のタスクを削除している
    */
    tasks = tasks.filter(function (t) {
      return t.id !== task.id;
    });

    /*
      削除後のtasks配列を保存
    */
    saveTasks();

    /*
      削除したタスクをカレンダーから消すため、
      カレンダーを再描画
    */
    renderCalendar();

    /*
      詳細パネルを初期表示へ戻す
    */
    taskDetail.innerHTML = "<p>課題を選択してください</p>";
  });

  /*
    作成した要素を右側パネルに追加する

    appendChildでHTML上に表示される
  */
  taskDetail.appendChild(title);
  taskDetail.appendChild(description);
  taskDetail.appendChild(assignee);
  taskDetail.appendChild(createdAt);
  taskDetail.appendChild(deadline);
  taskDetail.appendChild(status);
  taskDetail.appendChild(completeBtn);
  taskDetail.appendChild(editBtn);
  taskDetail.appendChild(deleteBtn);
}


/* ========================================
   タスク編集モーダル
======================================== */

/*
  タスク編集用のモーダルを表示する関数

  選択したタスクの現在の内容を入力欄にセットし、
  ユーザーが編集できるようにする
*/
function renderEditForm(task) {
  /*
    hiddenクラスを外してモーダルを表示する
  */
  modalOverlay.classList.remove("hidden");

  /*
    前回の編集フォームが残らないように中身を空にする
  */
  modalContent.innerHTML = "";

  /*
    課題名ラベルと入力欄
  */
  const titleLabel = document.createElement("label");
  titleLabel.textContent = "課題名";

  const titleEdit = document.createElement("input");
  titleEdit.classList.add("edit-input");
  titleEdit.value = task.title;

  /*
    詳細ラベルと入力欄
  */
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "詳細";

  const descriptionEdit = document.createElement("textarea");
  descriptionEdit.classList.add("edit-textarea");
  descriptionEdit.value = task.description;

  /*
    担当者ラベルと入力欄
  */
  const assigneeLabel = document.createElement("label");
  assigneeLabel.textContent = "担当者";

  const assigneeEdit = document.createElement("input");
  assigneeEdit.classList.add("edit-input");
  assigneeEdit.value = task.assignee || "";

  /*
    締切日ラベルと入力欄
  */
  const deadlineLabel = document.createElement("label");
  deadlineLabel.textContent = "締切日";

  const deadlineEdit = document.createElement("input");
  deadlineEdit.classList.add("edit-input");
  deadlineEdit.type = "date";
  deadlineEdit.value = task.deadline;

  /*
    保存ボタン
  */
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "保存";

  /*
    保存ボタンを押した時の処理
  */
  saveBtn.addEventListener("click", function () {
    /*
      課題名と締切日は必須

      どちらかが空なら保存せずに警告を出す
    */
    if (titleEdit.value === "" || deadlineEdit.value === "") {
      alert("課題名と締切日は必須です");
      return;
    }

    /*
      入力された値をtaskオブジェクトに反映する

      taskはtasks配列内のオブジェクトを参照しているため、
      ここで変更するとtasks内のデータも更新される
    */
    task.title = titleEdit.value;
    task.description = descriptionEdit.value;
    task.assignee = assigneeEdit.value;
    task.deadline = deadlineEdit.value;

    /*
      編集後の内容をlocalStorageへ保存
    */
    saveTasks();

    /*
      編集後の締切日がある月を表示する

      例：
      締切を7月に変更したら、7月のカレンダーへ移動する
    */
    viewDate = new Date(task.deadline);

    /*
      カレンダーと詳細パネルを最新状態に更新
    */
    renderCalendar();
    renderTaskDetail(task);

    /*
      編集完了後にモーダルを閉じる
    */
    closeModal();
  });

  /*
    キャンセルボタン
  */
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "キャンセル";

  /*
    編集内容を保存せずにモーダルを閉じる
  */
  cancelBtn.addEventListener("click", function () {
    closeModal();
  });

  /*
    作成した入力欄やボタンをモーダル内に追加する
  */
  modalContent.appendChild(titleLabel);
  modalContent.appendChild(titleEdit);
  modalContent.appendChild(descriptionLabel);
  modalContent.appendChild(descriptionEdit);
  modalContent.appendChild(assigneeLabel);
  modalContent.appendChild(assigneeEdit);
  modalContent.appendChild(deadlineLabel);
  modalContent.appendChild(deadlineEdit);
  modalContent.appendChild(saveBtn);
  modalContent.appendChild(cancelBtn);
}


/* ========================================
   カレンダー描画
======================================== */

/*
  カレンダー全体を描画する関数

  主な流れ：
  1. カレンダー表示エリアを空にする
  2. 表示する年月を取得
  3. 曜日行を作る
  4. 日付セルを作る
  5. 各日付に該当するタスクを表示
  6. 完成したtableを画面に追加する
*/
function renderCalendar() {
  /*
    古いカレンダーを削除する

    これをしないと、再描画のたびに
    カレンダーが下に増え続けてしまう
  */
  calendarTableArea.innerHTML = "";

  /*
    viewDateから表示中の年と月を取得
  */
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  /*
    カレンダー上部のタイトルを更新
    monthは0始まりなので +1 する
  */
  monthTitle.textContent = `${year}年${month + 1}月`;

  /*
    カレンダー用のtableを作成
  */
  const calendarTable = document.createElement("table");

  /*
    曜日行を作成
  */
  const headerRow = document.createElement("tr");
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  weekDays.forEach(function (day) {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });

  calendarTable.appendChild(headerRow);

  /*
    その月の1日と月末日を取得
  */
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);

  /*
    firstDay：
    その月の1日が何曜日か

    lastDay：
    その月が何日まであるか
  */
  const firstDay = firstDate.getDay();
  const lastDay = lastDate.getDate();

  /*
    カレンダーに表示する日付
  */
  let dateCount = 1;

  /*
    カレンダーは最大6週間分作る
  */
  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    /*
      1週間は7日分
    */
    for (let day = 0; day < 7; day++) {
      const td = document.createElement("td");

      /*
        1週目で、1日より前の曜日は空白にする

        例：
        1日が水曜日なら、日・月・火は空白
      */
      if (week === 0 && day < firstDay) {
        td.textContent = "";

        /*
          月末日を超えたら空白にする
        */
      } else if (dateCount > lastDay) {
        td.textContent = "";

        /*
          通常の日付セルを作る
        */
      } else {
        /*
          日付の数字を表示する
        */
        const dateText = document.createElement("div");
        dateText.classList.add("date-number");
        dateText.textContent = dateCount;
        td.appendChild(dateText);

        /*
          比較用の日付文字列を作る

          例：
          2026-06-09

          input type="date" の値と同じ形式にしている
        */
        const dateString =
          year +
          "-" +
          String(month + 1).padStart(2, "0") +
          "-" +
          String(dateCount).padStart(2, "0");

        const todayString = getTodayString();

        /*
          今日の日付ならtodayクラスを付ける
        */
        if (dateString === todayString) {
          td.classList.add("today");
        }

        /*
          すべてのタスクを確認し、
          この日付に表示すべきタスクを探す
        */
        tasks.forEach(function (task) {
          /*
            古いデータ対策

            createdAtがないタスクがあった場合、
            締切日を追加日として扱う
          */
          if (!task.createdAt) {
            task.createdAt = task.deadline;
          }

          /*
            古いデータ対策

            assigneeがundefinedの場合は空文字にする
          */
          if (task.assignee === undefined) {
            task.assignee = "";
          }

          /*
            タスクの表示条件

            dateStringが
            追加日以上 かつ 締切日以下なら表示する

            つまり、追加日から締切日までバー表示される
          */
          if (dateString >= task.createdAt && dateString <= task.deadline) {
            /*
              カレンダー上に表示するタスクボタンを作成
            */
            const taskBtn = document.createElement("button");
            taskBtn.classList.add("calendar-task-btn");

            /*
              日付によって表示する文字を変える

              開始日：
              タスク名

              締切日：
              〆 タスク名

              中間日：
              文字なしのバー
            */
            let label = "";

            if (dateString === task.createdAt && dateString === task.deadline) {
              label = task.title + " 〆";
            } else if (dateString === task.createdAt) {
              label = task.title;
            } else if (dateString === task.deadline) {
              label = "〆 " + task.title;
            }

            /*
              中間日の場合は文字なしバーにする
            */
            if (label === "") {
              taskBtn.textContent = "";
              taskBtn.classList.add("task-bar-only");
            } else {
              taskBtn.textContent = label;
            }

            /*
              完了済みならcompletedクラスを付ける

              CSS側で色を変えている
            */
            if (task.completed) {
              taskBtn.classList.add("completed");
            }

            /*
              タスクバーをクリックしたら詳細パネルを表示
            */
            taskBtn.addEventListener("click", function () {
              renderTaskDetail(task);
            });

            /*
              日付セルの中にタスクバーを追加
            */
            td.appendChild(taskBtn);
          }
        });

        /*
          次の日付へ進める
        */
        dateCount++;
      }

      /*
        作成した日付セルを行に追加
      */
      tr.appendChild(td);
    }

    /*
      1週間分の行をtableに追加
    */
    calendarTable.appendChild(tr);

    /*
      月末まで表示し終わったらループを終了
    */
    if (dateCount > lastDay) {
      break;
    }
  }

  /*
    完成したカレンダーを画面に表示
  */
  calendarTableArea.appendChild(calendarTable);
}


/* ========================================
   タスク追加処理
======================================== */

/*
  追加ボタンを押した時に新しいタスクを作成する
*/
addBtn.addEventListener("click", function () {
  /*
    入力欄の値を取得
  */
  const title = titleInput.value;
  const description = descriptionInput.value;
  const assignee = assigneeInput.value;
  const deadline = deadlineInput.value;

  /*
    課題名と締切日は必須

    どちらかが空ならエラーメッセージを表示して終了
  */
  if (title === "" || deadline === "") {
    errorMessage.textContent = "課題名と締切日は必須です";
    return;
  }

  /*
    エラーがなければメッセージを消す
  */
  errorMessage.textContent = "";

  /*
    新しいタスクオブジェクトを作成

    id：
    Date.now()を使って、作成時刻をもとにしたIDを入れる

    completed：
    最初は未完了なのでfalse
  */
  const task = {
    id: Date.now(),
    title: title,
    description: description,
    assignee: assignee,
    createdAt: getTodayString(),
    deadline: deadline,
    completed: false
  };

  /*
    tasks配列に新しいタスクを追加
  */
  tasks.push(task);

  /*
    localStorageへ保存
  */
  saveTasks();

  /*
    追加したタスクの締切月へカレンダーを移動する
  */
  viewDate = new Date(deadline);

  /*
    カレンダーを再描画して新しいタスクを表示する
  */
  renderCalendar();

  /*
    入力欄を空に戻す
  */
  titleInput.value = "";
  descriptionInput.value = "";
  assigneeInput.value = "";
  deadlineInput.value = "";
});


/* ========================================
   月移動ボタン
======================================== */

/*
  前の月を表示する
*/
prevBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

/*
  今日がある月へ戻る
*/
todayBtn.addEventListener("click", function () {
  viewDate = new Date();
  renderCalendar();
});

/*
  次の月を表示する
*/
nextBtn.addEventListener("click", function () {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});


/* ========================================
   初期表示
======================================== */

/*
  ページを開いた時に最初のカレンダーを表示する

  この1行がないと、ページを開いても
  カレンダーが表示されない
*/
renderCalendar();