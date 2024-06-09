const admins = {
    "admin@example.com": "admin123"
};

const users = {
    "user1@example.com": { password: "user123", name: "Быкова Ирина Геннадьевна", group: "ПКТб-20-1" },
    "user2@example.com": { password: "user456", name: "Волков Владислав Владимирович", group: "РИСб-20-1" },
    "user3@example.com": { password: "user789", name: "Солдаткин Никита Игоревич", group: "РИСб-20-1" }
};

const teachers = {
    "teacher1@example.com": "teacher123",
    "teacher2@example.com": "teacher456"
};

let token = localStorage.getItem('token');
let role = localStorage.getItem('role');
let selectedStudent = localStorage.getItem('selectedStudent');
let currentUserEmail = localStorage.getItem('currentUserEmail');

if (token && role) {
    if (role === 'teacher' && !selectedStudent) {
        showGroupSelection();
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
        localStorage.setItem('currentUserEmail', email);
        showGradebook();
    } else if (users[email] && users[email].password === password) {
        role = "user";
        token = generateJWT(email);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('currentUserEmail', email);
        showGradebook();
    } else if (teachers[email] && teachers[email] === password) {
        role = "teacher";
        token = generateJWT(email);
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('currentUserEmail', email);
        showGroupSelection();
    } else {
        alert('Неверные учетные данные');
    }
}

function generateJWT(email) {
    return btoa(JSON.stringify({ email }));
}

function showGroupSelection() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('group-selection-container').classList.remove('hidden');
}

function selectGroup() {
    const group = document.getElementById('group-select').value;
    const studentSelect = document.getElementById('student-select');
    studentSelect.innerHTML = ''; // Очистить существующие опции

    for (const email in users) {
        if (users[email].group === group) {
            const option = document.createElement('option');
            option.value = email;
            option.text = users[email].name;
            studentSelect.add(option);
        }
    }

    document.getElementById('group-selection-container').classList.add('hidden');
    document.getElementById('student-selection-container').classList.remove('hidden');
}

function selectStudent() {
    const studentEmail = document.getElementById('student-select').value;
    localStorage.setItem('selectedStudent', studentEmail);
    selectedStudent = studentEmail;
    showGradebook();
}

function showGradebook() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('group-selection-container').classList.add('hidden');
    document.getElementById('student-selection-container').classList.add('hidden');
    document.getElementById('gradebook-container').classList.remove('hidden');
    
    if (role === 'admin' || role === 'teacher') {
        document.getElementById('admin-controls').classList.remove('hidden');
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

    let subjects;
    if (role === 'user') {
        subjects = JSON.parse(localStorage.getItem(currentUserEmail)) || [];
    } else if (role === 'teacher') {
        subjects = JSON.parse(localStorage.getItem(selectedStudent)) || [];
    } else if (role === 'admin') {
        subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    }

    if (!subjects.length) {
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

        // Center align for specific columns except the first column
        cell2.style.textAlign = 'center';
        cell3.style.textAlign = 'center';
        cell4.style.textAlign = 'center';
        cell5.style.textAlign = 'center';
        
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
        const subjects = role === 'teacher' ? JSON.parse(localStorage.getItem(selectedStudent)) || [] : JSON.parse(localStorage.getItem(currentUserEmail)) || [];
        subjects.push({ subject: newSubject, hours: newHours, score: newScore, date: newDate, teacher: newTeacher });
        saveData(subjects);
        loadGradebook();
    }
}

function saveData(data) {
    if (role === 'teacher') {
        localStorage.setItem(selectedStudent, JSON.stringify(data));
    } else if (role === 'admin') {
        localStorage.setItem('subjects', JSON.stringify(data));
    } else {
        localStorage.setItem(currentUserEmail,
            JSON.stringify(data));
        }
    }
    
    function logout() {
        token = null;
        role = null;
        selectedStudent = null;
        currentUserEmail = null;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('selectedStudent');
        localStorage.removeItem('currentUserEmail');
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('gradebook-container').classList.add('hidden');
        document.getElementById('admin-controls').classList.add('hidden');
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        if (token && role) {
            if (role === 'teacher' && !selectedStudent) {
                showGroupSelection();
            } else {
                showGradebook();
            }
        } else {
            document.getElementById('login-container').classList.remove('hidden');
        }
    });
    

