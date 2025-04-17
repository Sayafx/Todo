let todoData
let currentListId  // 默认显示"我的一天"

// DOM元素
const myDayListBtn = document.getElementById('myDayList')
const importantListBtn = document.getElementById('importantList')
const taskListBtn = document.getElementById('tasksList')


// const allLists = document.querySelectorAll('.default-lists li, .user-lists li')
// const defaultLists = document.querySelector('.default-lists')
const userLists = document.querySelector('.user-lists')

const sidebar = document.querySelector('.sidebar')
const addListBtn = document.querySelector('.newls')

const addTaskBtn = document.querySelector('.add-task-form .btn-add')
const addTaskForm = document.querySelector('.add-task-form')
const addTaskInput = document.querySelector('.add-task-form .input')

const taskPanelTitle = document.querySelector('.list-title')
const calenderDateText = document.querySelector('.calender-date-text')

const tasks = document.querySelectorAll('.task')
const doneList = document.getElementById('done-ls')
const undoneList = document.getElementById('undone-ls')

// 初始化数据结构

const defaultData = { 
    currentListId: 'myDayList',
    lists: {
        myDayList: { listId:'myDayList', title: '我的一天', type: 'default'},
        importantList: { listId:'importantList', title: '重要', type: 'default'},
        tasksList: { listId:'tasksList', title: '任务', type: 'default'},
    },
    tasks: {}
}


// 数据存储函数

function saveData() {
    localStorage.setItem('todoData', JSON.stringify(todoData))
}

function loadData() {
    const savedData = localStorage.getItem('todoData')
    return savedData ? JSON.parse(savedData) : {...defaultData}
}


//初始化

function init() {
    todoData = loadData()
    // currentListId = todoData.currentListId
    // const allLists = todoData.lists
    renderTasks()
    renderLists()
    renderTaskPanelTitle()

    //事件委托
    //所有列表切换任务列表+事件委托
    sidebar.addEventListener('click', (e) => {
        const listItem = e.target.closest('li[data-id]')
        if (!listItem) return

        todoData.currentListId = listItem.dataset.id
        saveData()
        renderTasks()
        renderTaskPanelTitle()

    })

    //user-list 添加双击事件
    userLists.addEventListener('dblclick', (e) => {
        const listItem = e.target.closest('li[data-id]')
        if (!listItem) return
        console.log('已经双击了' + listItem.innerHTML)
        editListName(listItem)
    })
}

//任务列表标题

function renderTaskPanelTitle() {


    taskPanelTitle.textContent = todoData.lists[todoData.currentListId].title
    
    if (todoData.currentListId === 'myDayList') {
        //显示正确的日期
        calenderDateText.style.display = 'block'; // 恢复显示
        calenderDateText.textContent = getFormattedDate();
    } else {
        // 删除calenderDateText这个元素
        // console.log('else')
        calenderDateText.style.display = 'none';
        // calenderDateText.remove()
    }
    // calenderDateText
}

function getFormattedDate() {
    const now = new Date();
    const month = now.getMonth() + 1; // 月份从0开始，所以要+1
    const date = now.getDate();
    const day = now.getDay(); // 星期几（0-6）
    
    // 中文星期数组
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    return `${month}月${date}日 ${weekdays[day]}`;
}

//渲染任务sidebar列表

function renderTasks() {
    //清除任务列表
    doneList.innerHTML = ``
    undoneList.innerHTML = ``

    //获取当前列表的任务并添加DOM
    const currentListTasks = Object.values(todoData.tasks)
        .filter(task => task.listIds && task.listIds.includes(todoData.currentListId))
    console.log(currentListTasks)
    //没有匹配到，不渲染任务
    if (!currentListTasks) return
    // 匹配到任务，渲染任务
        else{
            currentListTasks.forEach(task => {
                renderTaskDom(task)
            })
        }

}

function renderTaskDom(task) {
    const li = document.createElement('li')
    li.className = 'task'
    li.dataset.id = task.id
    
    li.innerHTML = `
        <i class="fa-solid fa-check"></i>
        <span class="task-name">${task.title}</span>
    `

    if (task.done) {
        //已完成，添加 done 类名
        li.classList.add('done')
        doneList.insertBefore(li, doneList.firstChild)
    } else {
        //未完成，删除 done 类名
        li.classList.remove('done')
        undoneList.insertBefore(li, undoneList.firstChild)
    }

    return li

}

// 事件处理：任务完成切换

undoneList.addEventListener('click', handelTaskClick)
doneList.addEventListener('click', handelTaskClick)

function handelTaskClick(e) {
    const checkEl = e.target.closest('.fa-check')
    if (!checkEl) return
    const taskEl = checkEl.closest('.task')
    taskStatus(taskEl)
    renderTasks()
}

// 根据任务完成状态，添加类名
function taskStatus(taskEl) {

    //获取任务ID
    const taskId = taskEl.dataset.id
    //获取任务对象数据结构
    const task = todoData.tasks[taskId]
    //确定任务存在
    if (!task) return

    task.done = !task.done
    saveData()
}

// 任务拖拽排序

// tasks.forEach(taskEl => {
//     // 使用HTML5的draggable API
//     taskEl.draggable = true;
//     taskEl.addEventListener('dragstart', handleDragStart);

//     function handleDragStart(e) {
//     e.dataTransfer.setData('text/plain', e.target.id);
//     e.target.classList.add('dragging');
//     }
// })


// 添加新任务

addTaskBtn.addEventListener('click',  (e) => {
    e.preventDefault()
    addNewTask()
})
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault()
    addNewTask()
})

function addNewTask(taskName) {
    loadData()
    let taskTitle = addTaskInput.value.trim()

    if (taskName) {
        taskTitle = taskName
    }

    if (!taskTitle) return //空任务名不添加


    const newTask = {
        id: 'task-' + Date.now(),
        title: taskTitle,
        done: false,
        important: false,
        dueDate: null,
        listIds: [todoData.currentListId, 'tasksList'], // 添加到当前列表和总任务列表
        createdAt: new Date().toISOString(),
        doneAt: null
    }

    todoData.tasks[newTask.id] = newTask

    renderTaskDom(newTask)
    renderTasks()

    saveData();

    addTaskInput.value = '' // 清除文本框
    addTaskInput.focus(); //输入框自动聚焦

}

// ========== 切换任务列表 ==========

//渲染侧边栏列表

function renderLists() {
    //清除任务列表
    userLists.innerHTML = ``

    //获取自定义列表，添加入data保存,并添加DOM
    const Lists = Object.values(todoData.lists)
        .filter(list => list.type && list.type.includes('user'))
    console.log(Lists)
    Lists.forEach(list => {
        renderListDom(list)
    })
}

function renderListDom(list) {
    const li = document.createElement('li')
    li.dataset.id = list.listId
    li.className = 'user-ls'
    li.textContent = list.title
    
    userLists.appendChild(li)
    return li

}


//切换右侧界面标题、界面颜色
//新建任务列表

addListBtn.addEventListener('click', () => {
    //唯一listID
    const listId = 'list-' + Date.now()
    //默认标题
    const defaultTitle = '无标题列表' 
    let title = defaultTitle
    //检测是否有重复标题，如果重复末尾加(counter)
    let counter = 1
    const existingTitles = Object.values(todoData.lists).map(list => list.title)

    while (existingTitles.includes(title)) {
        title = `${defaultTitle}（${counter}）`
        counter++
    }

    //创建新列表数据结构
    const newList = {
        title,
        listId,
        type: 'user'
    }
    //保存到数据
    todoData.lists[listId] = newList
    saveData()
    renderLists()

    //找到新建列表，并自动进入编辑状态
    const newListItem = document.querySelector(`li[data-id="${listId}"]`)
    // const newListItem = document.querySelector(`#${listId}`)
    if (newListItem) {
        editListName(newListItem)
    }

})

//编辑列表名称函数
function editListName(listItem) {
    const listId = listItem.dataset.id
    const currentText = listItem.textContent.trim()
    //创建输入框
    const input = document.createElement('input')
    input.type = 'text'
    input.value = currentText
    input.className = 'list-edit-input'
    
    //将list名称换为输入框内容
    listItem.innerHTML = ``
    listItem.appendChild(input)
    input.focus()

    //保存内容函数，更新数据并恢复显示
    const saveListEdit = () => {
        const newTitle = input.value.trim()
        if (newTitle && newTitle !== currentText) {
            todoData.lists[listId].title = newTitle
            saveData()
        }
        listItem.textContent = newTitle || currentText
    }

    //回车调用保存
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveListEdit()
        }
    })

    //失去焦点调用保存
    input.addEventListener('blur', saveListEdit)
}




//初始化应用
document.addEventListener('DOMContentLoaded', init);
