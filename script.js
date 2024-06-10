const teachers = {
    "teacher1@mail.ru": "teacher123",
    "teacher2@mail.ru": "teacher456"
};

const users = {
    "user1@mail.ru": { password: "user123", group: "ПКТб-20-1", name: "Волков Владислав Владимирович" },
    "user2@mail.ru": { password: "user456", group: "ПКТб-20-1", name: "Быкова Ирина Геннадьевна" },
    "user3@mail.ru": { password: "user789", group: "МКМб-20-1", name: "Мамедов Вадим Николаевич" }
};
let token = localStorage.getItem('token');
let role = localStorage.getItem('role');
let currentUser = localStorage.getItem('currentUser');

if (token && role) {
    if (role === 'teacher') {
        showGroupSelect();
    } else {
        showGradebook();
    }
} else {
    document.getElementById('login-container').classList.remove('hidden');
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (teachers[email] && teachers[email] === password) {
        role = "teacher";
        token = generateJWT(email);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('currentUser', email);
        document.getElementById('login-container').classList.add('hidden');
        showGroupSelect();
    } else if (users[email] && users[email].password === password) {
        role = "user";
        token = generateJWT(email);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('currentUser', email);
        document.getElementById('login-container').classList.add('hidden');
        showGradebook();
    } else {
        alert('Неверные учетные данные');
    }
}

function generateJWT(email) {
    return btoa(JSON.stringify({ email }));
}

function showGroupSelect() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('group-select-container').classList.remove('hidden');

    const groups = new Set(Object.values(users).map(user => user.group));
    const groupSelect = document.getElementById('group-select');
    
    // Очищаем все предыдущие опции
    groupSelect.innerHTML = '';

    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });

    loadStudents();
}

function loadStudents() {
    const selectedGroup = document.getElementById('group-select').value;
    const studentSelect = document.getElementById('student-select');
    studentSelect.innerHTML = '';

    for (const [email, user] of Object.entries(users)) {
        if (user.group === selectedGroup) {
            const option = document.createElement('option');
            option.value = email;
            option.textContent = user.name;
            studentSelect.appendChild(option);
        }
    }
}

function showGradebook() {
    document.getElementById('group-select-container').classList.add('hidden');
    document.getElementById('gradebook-container').classList.remove('hidden');

    if (role === 'teacher') {
        const selectedStudent = document.getElementById('student-select').value;
        currentUser = selectedStudent;
        document.getElementById('teacher-controls').classList.remove('hidden');
    } else {
        currentUser = localStorage.getItem('currentUser');
    }

    loadGradebook();
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

function loadGradebook() {
    const tbody = document.getElementById('gradebook').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    let subjects = JSON.parse(localStorage.getItem(`subjects_${currentUser}`));

    subjects.forEach(subj => {
        const row = tbody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);

        cell1.innerHTML = subj.subject;
        cell2.innerHTML = subj.hours;
        cell3.innerHTML = subj.score;
        cell4.innerHTML = formatDate(subj.date);
        cell5.innerHTML = subj.teacherName;

        if (role === 'teacher' && subj.teacher === localStorage.getItem('currentUser')) {
            cell1.contentEditable = true;
            cell2.contentEditable = true;
            cell3.contentEditable = true;
            cell4.contentEditable = true;
            cell5.contentEditable = true;

            cell1.addEventListener('blur', () => {
                subj.subject = cell1.innerHTML;
                saveData(subjects);
            });
            cell2.addEventListener('blur', () => {
                subj.hours = cell2.innerHTML;
                saveData(subjects);
            });
            cell3.addEventListener('blur', () => {
                subj.score = cell3.innerHTML;
                saveData(subjects);
            });
            cell4.addEventListener('blur', () => {
                subj.date = parseDate(cell4.innerHTML);
                saveData(subjects);
            });
            cell5.addEventListener('blur', () => {
                subj.teacherName = cell5.innerHTML;
                saveData(subjects);
            });
        }
    });
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
}

function addSubject() {
    const newSubject = document.getElementById('new-subject').value;
    const newHours = document.getElementById('new-hours').value;
    const newScore = document.getElementById('new-score').value;
    const newDate = document.getElementById('new-date').value;
    const newTeacher = document.getElementById('new-teacher').value;

    if (newSubject && newHours && newScore && newDate && newTeacher) {
        const subjects = JSON.parse(localStorage.getItem(`subjects_${currentUser}`)) || [];
        subjects.push({ subject: newSubject, hours: newHours, score: newScore, date: newDate, teacherName: newTeacher, teacher: localStorage.getItem('currentUser') });
        saveData(subjects);
        loadGradebook();
    }
}

function saveData(data) {
    localStorage.setItem(`subjects_${currentUser}`, JSON.stringify(data));
}

function back() {
    document.getElementById('gradebook-container').classList.add('hidden');
    document.getElementById('teacher-controls').classList.add('hidden');
    document.getElementById('group-select-container').classList.remove('hidden');
}

function logout() {
    token = null;
    role = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('gradebook-container').classList.add('hidden');
    document.getElementById('teacher-controls').classList.add('hidden');
    document.getElementById('group-select-container').classList.add('hidden');
}
