async function loadDailyReport() {

    const response = await fetch(
        "http://127.0.0.1:8000/report/daily"
    );

    const data = await response.json();

    renderTable(data);
}

async function loadMonthlyReport() {

    const response = await fetch(
        "http://127.0.0.1:8000/report/monthly"
    );

    const data = await response.json();

    renderTable(data);
}

function renderTable(records) {

    const tbody =
        document.getElementById("reportTable");

    tbody.innerHTML = "";

    records.forEach(record => {

        tbody.innerHTML += `
        <tr>
            <td>${record.userid}</td>
            <td>${record.name}</td>
            <td>${record.date}</td>
            <td>${record.status}</td>
        </tr>
        `;
    });
}

loadDailyReport();
function exportExcel() {

    window.open(
        "http://127.0.0.1:8000/report/export/excel",
        "_blank"
    );
}