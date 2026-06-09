let allStudents = [];
async function loadStudents() {

    const response =
        await fetch("http://127.0.0.1:8000/students");

    allStudents =
    await response.json();

const students = allStudents;

    const tbody =
        document.getElementById("attendanceTable");

    tbody.innerHTML = "";

    students.forEach(student => {

        tbody.innerHTML += `
        <tr>
            <td>${student.userid}</td>
            <td>${student.name}</td>
            <td>${student.registration_date}</td>
            <td>${student.registration_time}</td>
            <td>${student.location}</td>
            <td>
        
    <button
        class="edit-btn"
        onclick="editStudent('${student.userid}','${student.name}')"
    >
        Edit
    </button>

    <button
        class="delete-btn"
        onclick="deleteStudent('${student.userid}')"
    >
        Delete
    </button>

    </td>
        </tr>
        `;
    });
}

loadStudents();
async function deleteStudent(userid) {

    if (!confirm("Delete this student?")) {
        return;
    }

    const response = await fetch(
        `http://127.0.0.1:8000/students/${userid}`,
        {
            method: "DELETE"
        }
    );
    const data = await response.json();

    alert(data.message);

    loadStudents();

}
async function editStudent(userid, currentName) {

    const newName = prompt(
        "Enter new name:",
        currentName
    );

    if (!newName) return;

    const response = await fetch(
        `http://127.0.0.1:8000/students/${userid}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newName
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    loadStudents();
}