async function loadDailyReport() {

    const response = await fetch(
        "http://127.0.0.1:8000/report/daily"
    );

    const data = await response.json();

    const tbody =
        document.getElementById("dailyTable");

    tbody.innerHTML = "";

    data.forEach(record => {

        tbody.innerHTML += `
        <tr>
            <td>${record.userid}</td>
            <td>${record.name}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td class="present">${record.status}</td>
        </tr>
        `;
    });
}

loadDailyReport();