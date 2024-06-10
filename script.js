const admins = {
    "admin@example.com": "admin123"
};

const users = {
    "user1@example.com": { password: "user123", group: "ПКТб-20-1", name: "Волков Владислав Владимирович" },
    "user2@example.com": { password: "user456", group: "ПКТб-20-1", name: "Быкова Ирина Геннадьевна" },
    "user3@example.com": { password: "user789", group: "МКМб-20-1", name: "Мамедов Вадим Николаевич" }
};

let token = localStorage.getItem('token');
let role = localStorage.getItem('role');
let currentUser = localStorage.getItem('currentUser');

if (token && role) {
    if (role === 'admin') {
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

    if (admins[email] && admins[email] === password) {
        role = "admin";
        token = generateJWT(email);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
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
    // Для простоты используем base64 кодирование в качестве фиктивного JWT
    return btoa(JSON.stringify({ email }));
}

function showGroupSelect() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('group-select-container').classList.remove('hidden');

    const groups = new Set(Object.values(users).map(user => user.group));
    const groupSelect = document.getElementById('group-select');

    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });

    loadStudents(); // Load students for the first group by default
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

    if (role === 'admin') {
        const selectedStudent = document.getElementById('student-select').value;
        currentUser = selectedStudent;
        document.getElementById('admin-controls').classList.remove('hidden');
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
    tbody.innerHTML = ''; // Очистить существующие строки

    let subjects = JSON.parse(localStorage.getItem(`subjects_${currentUser}`));

    if (!subjects || !Array.isArray(subjects) || !subjects.length || !subjects[0].hasOwnProperty('hours')) {
        // Если данные отсутствуют или имеют старый формат, инициализировать их новыми данными
        subjects = [
            { subject: 'Математический анализ', hours: 120, score: 91, date: '2024-06-12', teacher: 'Иванов И.И.' },
            { subject: 'Английский язык', hours: 80, score: 88, date: '2024-06-12', teacher: 'Петрова А.А.' },
            { subject: 'Физическая культура', hours: 60, score: 95, date: '2024-06-12', teacher: 'Сидоров С.С.' },
            { subject: 'Философия', hours: 100, score: 76, date: '2024-06-12', teacher: 'Кузнецова Н.Н.' },
            { subject: 'Инженерная графика', hours: 90, score: 82, date: '2024-06-12', teacher: 'Морозов В.В.' },
            { subject: 'Машинное обучение', hours: 110, score: 89, date: '2024-06-12', teacher: 'Смирнов Д.Н.' }
        ];
        saveData(subjects);
    }

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
        cell5.innerHTML = subj.teacher;

        if (role === 'admin') {
            cell2.contentEditable = true;
            cell3.contentEditable = true;
            cell4.contentEditable = true;
            cell5.contentEditable = true;

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
                subj.teacher = cell5.innerHTML;
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
        subjects.push({ subject: newSubject, hours: newHours, score: newScore, date: newDate, teacher: newTeacher });
        saveData(subjects);
        loadGradebook();
    }
}

function saveData(data) {
    localStorage.setItem(`subjects_${currentUser}`, JSON.stringify(data));
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
    document.getElementById('admin-controls').classList.add('hidden');
    document.getElementById('group-select-container').classList.add('hidden');
}

