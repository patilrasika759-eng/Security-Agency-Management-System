const form = document.querySelector(
            `form[data-record-key="${config.key}"]`
        );

        if (!form) return;

        const table = document.querySelector(
            `table[data-record-table="${config.tableKey}"]`
        );

        const message = form.querySelector(".message");
        const button = form.querySelector('[type="submit"]');

        async function loadRecords() {
            if (!table) return;

            try {
                const result = await apiRequest(config.endpoint);
                const records = getRecords(result);
                const columns = (table.dataset.columns || "")
                    .split(",")
                    .filter(Boolean);

                const thead = table.querySelector("thead");
                const tbody = table.querySelector("tbody");

                if (!thead || !tbody) return;

                thead.replaceChildren();
                tbody.replaceChildren();

                const header = document.createElement("tr");

                columns.forEach(column => {
                    const th = document.createElement("th");
                    th.textContent = column;
                    header.appendChild(th);
                });

                thead.appendChild(header);

                records.forEach(record => {
                    const row = document.createElement("tr");

                    columns.forEach(column => {
                        const cell = document.createElement("td");
                        cell.textContent = record[column] ?? "";
                        row.appendChild(cell);
                    });

                    tbody.appendChild(row);
                });
            } catch (error) {
                console.error(
                    `${config.key} records load error:`,
                    error.message
                );
            }
        }

        form.addEventListener("submit", async event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const data = Object.fromEntries(
                new FormData(form).entries()
            );

            if (button) button.disabled = true;
            showMessage(message, "Saving...", true);

            try {
                await apiRequest(config.endpoint, {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                showMessage(message, "Record saved successfully!", true);
                form.reset();

                await loadRecords();
            } catch (error) {
                showMessage(message, "Save failed: " + error.message);
                console.error(`${config.key} save error:`, error);
            } finally {
                if (button) button.disabled = false;
            }
        });

        loadRecords();

/* =====================================
   MASTER RECORDS: GUARDS, CLIENTS, SITES
===================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("masterRecordForm");
    if (!form) return;

    const typeInput = document.getElementById("recordType");
    const idInput = document.getElementById("recordId");
    const nameInput = document.getElementById("recordName");
    const extraInput = document.getElementById("recordExtra");
    const emailInput = document.getElementById("recordEmail");
    const statusInput = document.getElementById("recordStatus");
    const message = document.getElementById("recordMessage");
    const tbody = document.getElementById("masterRecordsBody");
    const searchInput = document.getElementById("recordSearch");
    const extraLabel = document.getElementById("recordExtraLabel");
    const extraHeading = document.getElementById("extraColumnHeading");
    const heading = document.getElementById("recordHeading");
    const description = document.getElementById("recordDescription");
    const submitButton = document.getElementById("recordSubmit");

    if (!typeInput || !nameInput || !extraInput || !tbody) return;

    // Guard model ला guardId आणि salary आवश्यक आहेत.
    let guardIdField = document.getElementById("masterGuardId");
    if (!guardIdField) {
        guardIdField = document.createElement("input");
        guardIdField.type = "hidden";
        guardIdField.id = "masterGuardId";
        form.appendChild(guardIdField);
    }

    let salaryLabel = document.getElementById("masterSalaryLabel");
    let salaryInput = document.getElementById("masterSalary");

    if (!salaryLabel) {
        salaryLabel = document.createElement("label");
        salaryLabel.id = "masterSalaryLabel";
        salaryLabel.textContent = "Salary / पगार";

        salaryInput = document.createElement("input");
        salaryInput.id = "masterSalary";
        salaryInput.type = "number";
        salaryInput.min = "0";
        salaryInput.step = "any";
        salaryInput.required = true;
        salaryInput.placeholder = "Enter salary";

        salaryLabel.appendChild(salaryInput);

        const actions = form.querySelector(".form-actions");
        form.insertBefore(salaryLabel, actions);
    }

    const settings = {
        guards: {
            endpoint: "/guards",
            title: "Guard Records / रक्षक नोंदी",
            extra: "Phone / फोन",
            heading: "Phone / फोन"
        },
        clients: {
            endpoint: "/clients",
            title: "Client Records / ग्राहक नोंदी",
            extra: "Phone / फोन",
            heading: "Phone / फोन"
        },
        sites: {
            endpoint: "/sites",
            title: "Site Records / साइट नोंदी",
            extra: "Address / पत्ता",
            heading: "Address / पत्ता"
        }
    };

    let currentRecords = [];

    function currentType() {
        return settings[typeInput.value] ? typeInput.value : "guards";
    }

    function recordList(result) {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result.data)) return result.data;
        if (Array.isArray(result.guards)) return result.guards;
        if (Array.isArray(result.clients)) return result.clients;
        if (Array.isArray(result.sites)) return result.sites;
        return [];
    }

    function valueOf(record, ...keys) {
        for (const key of keys) {
            if (record[key] !== undefined && record[key] !== null) {
                return record[key];
            }
        }
        return "";
    }

    function showNotice(text, success = false) {
        if (message) {
            showMessage(message, text, success);
        }
    }

    function renderRecords() {
        const query = (searchInput?.value || "").toLowerCase().trim();
        tbody.replaceChildren();

        const filtered = currentRecords.filter(record =>
            Object.values(record).some(value =>
                String(value ?? "").toLowerCase().includes(query)
            )
        );

        filtered.forEach(record => {
            const row = document.createElement("tr");

            const cells = [
                valueOf(record, "guardId", "clientId", "siteId", "id", "_id"),
                valueOf(record, "fullName", "name", "siteName", "clientName"),
                valueOf(record, "phone", "address"),
                valueOf(record, "email"),
                valueOf(record, "status")
            ];

            cells.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = String(value);
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            actionCell.textContent = "—";
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });

        const empty = document.getElementById("recordsEmpty");
        if (empty) {
            empty.hidden = filtered.length > 0;
        }
    }

    async function loadMasterRecords() {
        try {
            const result = await apiRequest(settings[currentType()].endpoint);
            currentRecords = recordList(result);
            renderRecords();
        } catch (error) {
            currentRecords = [];
            renderRecords();
            console.error("Master records load error:", error);
            showNotice("Records load झाले नाहीत: " + error.message);
        }
    }

    function switchTab(type) {
        if (!settings[type]) return;

        typeInput.value = type;
        idInput.value = "";
        form.reset();
        typeInput.value = type;

        const config = settings[type];
        heading.textContent = config.title;
        extraLabel.firstChild.textContent = config.extra;
        extraHeading.textContent = config.heading;
        salaryLabel.hidden = type !== "guards";
        salaryInput.required = type === "guards";
        extraInput.type = "text";
        extraInput.placeholder =
            type === "sites" ? "Enter site address" : "Enter phone number";

        document.querySelectorAll("[data-record-tab]").forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.recordTab === type
            );
        });

        showNotice("");
        loadMasterRecords();
    }

    document.querySelectorAll("[data-record-tab]").forEach(tab => {
        tab.addEventListener("click", () => {
            switchTab(tab.dataset.recordTab);
        });
    });

    searchInput?.addEventListener("input", renderRecords);

    document.getElementById("recordCancel")?.addEventListener("click", () => {
        form.reset();
        idInput.value = "";
        typeInput.value = currentType();
        showNotice("");
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const type = currentType();
        const common = {
            email: emailInput.value.trim(),
            status: statusInput.value
        };

        let data;

        if (type === "guards") {
            data = {
                guardId: "G" + Date.now(),
                fullName: nameInput.value.trim(),
                phone: extraInput.value.trim(),
                email: common.email,
                status: common.status,
                salary: Number(salaryInput.value)
            };
        } else if (type === "clients") {
            data = {
                name: nameInput.value.trim(),
                phone: extraInput.value.trim(),
                email: common.email,
                status: common.status
            };
        } else {
            data = {
                name: nameInput.value.trim(),
                address: extraInput.value.trim(),
                email: common.email,
                status: common.status
            };
        }

        submitButton.disabled = true;
        showNotice("Saving record...", true);

        try {
            const result = await apiRequest(settings[type].endpoint, {
                method: "POST",
                body: JSON.stringify(data)
            });

            showNotice(result.message || "Record saved successfully!", true);
            form.reset();
            typeInput.value = type;
            idInput.value = "";

            await loadMasterRecords();
        } catch (error) {
            showNotice("Save failed: " + error.message);
            console.error("Master record save error:", error);
        } finally {
            submitButton.disabled = false;
        }
    });

    switchTab("guards");
});


document.addEventListener("DOMContentLoaded", function () {
    const daysInput = document.getElementById("daysWorked");
    const rateInput = document.getElementById("dailyRate");
    const allowanceInput = document.getElementById("allowance");
    const deductionInput = document.getElementById("deduction");
    const totalElement = document.getElementById("payrollTotal");

    if (!daysInput || !rateInput || !allowanceInput ||
        !deductionInput || !totalElement) {
        return;
    }

    function calculatePayroll() {
        const days = Number(daysInput.value) || 0;
        const rate = Number(rateInput.value) || 0;
        const allowance = Number(allowanceInput.value) || 0;
        const deduction = Number(deductionInput.value) || 0;

        const total = Math.max(
            0,
            days * rate + allowance - deduction
        );

        totalElement.textContent = total.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        });
    }

    [daysInput, rateInput, allowanceInput, deductionInput]
        .forEach(function (input) {
            input.addEventListener("input", calculatePayroll);
        });

    calculatePayroll();
});

/* =====================================
   CLIENT INVOICE: CALCULATE AND SAVE
===================================== */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(
        'form[data-record-key="invoices"]'
    );

    const shiftsInput = document.getElementById("invoiceShifts");
    const rateInput = document.getElementById("invoiceRate");
    const taxInput = document.getElementById("invoiceTax");
    const totalElement = document.getElementById("invoiceTotal");

    if (!form) {
        console.warn("Invoice form not found.");
        return;
    }

    const message = form.querySelector(".message");
    const button = form.querySelector('[type="submit"]');

    function calculateInvoice() {
        const shifts = Number(shiftsInput?.value) || 0;
        const rate = Number(rateInput?.value) || 0;
        const tax = Number(taxInput?.value) || 0;

        const subtotal = shifts * rate;
        const total = subtotal + subtotal * tax / 100;

        if (totalElement) {
            totalElement.textContent = total.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2
            });
        }

        return total;
    }

    [shiftsInput, rateInput, taxInput].forEach(input => {
        input?.addEventListener("input", calculateInvoice);
    });

    calculateInvoice();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        if (typeof apiRequest !== "function") {
            if (message) {
                message.textContent = "API connection function not found.";
            }
            return;
        }

        const data = Object.fromEntries(
            new FormData(form).entries()
        );

        data.shifts = Number(data.shifts);
        data.rate = Number(data.rate);
        data.tax = Number(data.tax || 0);
        data.total = calculateInvoice();

        if (button) button.disabled = true;
        if (message) message.textContent = "Saving invoice...";

        try {
            const result = await apiRequest("/invoices", {
                method: "POST",
                body: JSON.stringify(data)
            });

            if (message) {
                message.textContent =
                    result.message || "Invoice saved successfully!";
            }

            form.reset();
            calculateInvoice();
        } catch (error) {
            if (message) {
                message.textContent = "Invoice save failed: " + error.message;
            }
            console.error("Invoice save error:", error);
        } finally {
            if (button) button.disabled = false;
        }
    });
});

/* ==========================================
   REPORTS DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:5000/api";

    const reportMessage = document.getElementById("reportMessage");
    const refreshButton = document.getElementById("refreshReports");
    const exportButton = document.getElementById("exportCSV");

    let attendanceRecords = [];

    async function fetchRecords(endpoint) {
        const response = await fetch(API + endpoint);

        if (!response.ok) {
            throw new Error(`API error: ${endpoint} (${response.status})`);
        }

        return response.json();
    }

    function recordsFrom(result, key) {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.[key])) return result[key];
        if (Array.isArray(result?.records)) return result.records;
        if (Array.isArray(result?.data)) return result.data;
        return [];
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function renderAttendance(records) {
        const tbody = document.querySelector(
            "#attendanceReportTable tbody"
        );
        const empty = document.getElementById("attendanceEmpty");

        if (!tbody) return;

        tbody.replaceChildren();

        records.forEach(record => {
            const row = document.createElement("tr");

            const values = [
                record.date || record.attendanceDate || "",
                record.guardName || record.guard || record.guardId || "",
                record.siteName || record.site || record.siteId || "",
                record.checkIn || record.checkin || "",
                record.checkOut || record.checkout || "",
                record.status || ""
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = String(value);
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        if (empty) {
            empty.hidden = records.length > 0;
        }
    }

    async function refreshReports() {
        try {
            if (reportMessage) {
                reportMessage.textContent = "Loading reports...";
            }

            const [guardsResult, sitesResult, attendanceResult, invoicesResult] =
                await Promise.all([
                    fetchRecords("/guards"),
                    fetchRecords("/sites"),
                    fetchRecords("/attendance"),
                    fetchRecords("/invoices")
                ]);

            const guards = recordsFrom(guardsResult, "guards");
            const sites = recordsFrom(sitesResult, "sites");
            attendanceRecords = recordsFrom(attendanceResult, "attendance");
            const invoices = recordsFrom(invoicesResult, "invoices");

            const from = document.getElementById("fromDate")?.value;
            const to = document.getElementById("toDate")?.value;

            const filteredAttendance = attendanceRecords.filter(record => {
                const date = String(
                    record.date || record.attendanceDate || ""
                ).slice(0, 10);

                if (from && date && date < from) return false;
                if (to && date && date > to) return false;
                return true;
            });

            const activeSites = sites.filter(site =>
                String(site.status || "").toLowerCase() === "active"
            );

            const pendingInvoices = invoices.filter(invoice =>
                ["pending", "overdue", "draft"].includes(
                    String(invoice.status || "").toLowerCase()
                )
            );

            setText("reportGuards", guards.length);
            setText("reportSites", activeSites.length);
            setText("reportInvoices", pendingInvoices.length);

            renderAttendance(filteredAttendance);

            const now = new Date();
            const day = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((day + 6) % 7));
            monday.setHours(0, 0, 0, 0);

            const weeklyCount = attendanceRecords.filter(record => {
                const rawDate = record.date || record.attendanceDate;
                if (!rawDate) return false;

                const date = new Date(rawDate);
                return !Number.isNaN(date.getTime()) &&
                    date >= monday &&
                    date <= now;
            }).length;

            setText("weeklyAttendance", weeklyCount);

            // These figures require matching backend routes/data.
            setText("reportIncidents", "—");
            setText("pendingPayroll", "—");
            setText("auditCount", "—");

            if (reportMessage) {
                reportMessage.textContent = "Reports refreshed.";
            }
        } catch (error) {
            if (reportMessage) {
                reportMessage.textContent =
                    "Reports load failed: " + error.message;
            }
            console.error("Reports error:", error);
        }
    }

    function exportCSV() {
        const table = document.getElementById("attendanceReportTable");
        if (!table) return;

        const rows = [...table.querySelectorAll("tr")].map(row =>
            [...row.querySelectorAll("th, td")].map(cell =>
                '"' + cell.innerText.replace(/"/g, '""') + '"'
            ).join(",")
        );

        const csv = "\uFEFF" + rows.join("\r\n");
        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "attendance-report.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    refreshButton?.addEventListener("click", refreshReports);
    exportButton?.addEventListener("click", exportCSV);

    refreshReports();
});
