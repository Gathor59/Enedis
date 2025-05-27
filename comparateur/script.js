let consumptionData = [];
let calculatedResults = {};
let hcPeriodCount = 2;
let customPeriodCount = 3;

const JOURS_TEMPO = {
    "Rouge": [
        "2024-01-08", "2024-01-09", "2024-01-10", "2024-01-11",
        "2024-01-12", "2024-01-15", "2024-01-16", "2024-01-18", "2024-01-19",
        "2024-02-12", "2024-01-27", "2024-01-28",
        "2024-02-12", "2024-02-27", "2024-02-28",
        "2024-03-04", "2024-03-05", "2024-03-06", 
        "2024-03-11", "2024-03-12", "2024-03-29",
        "2024-12-03", "2024-12-10", "2024-12-11", "2024-12-12",
        "2024-12-13", "2024-12-16", "2024-12-27", "2024-12-30",
        "2025-01-02", "2025-01-03", "2025-01-10", "2025-01-13",
        "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17",
        "2025-01-20", "2025-01-21", "2025-01-22", "2025-01-30",
        "2025-01-31", "2025-02-03"
    ],
    "Blanc": [
        "2024-01-04", "2024-01-05", "2024-01-06", 
        "2024-01-13", "2024-01-17", "2024-01-20",
        "2024-01-26", "2024-01-29", "2024-01-30", "2024-01-31",
        "2024-02-01", "2024-02-02", "2024-02-05", "2024-02-13",
        "2024-02-19", "2024-02-20", "2024-02-23", "2024-02-24",
        "2024-02-26", "2024-02-29", 
        "2024-03-07", "2024-03-08", "2024-03-13", "2024-03-26",
        "2024-04-10", "2024-04-18", "2024-04-22", "2024-04-23",
        "2024-04-24", "2024-04-25", "2024-04-26",
        "2024-11-14", "2024-11-15", "2024-11-20",
        "2024-11-21", "2024-11-22", "2024-11-28",
        "2024-12-04", "2024-12-09", "2024-12-14",
        "2024-12-17", "2024-12-20", "2024-12-23",
        "2024-12-24", "2024-12-26", "2024-12-28", "2024-12-31",
        "2025-01-04", "2025-01-07", "2025-01-08", "2025-01-09",
        "2025-01-11", "2025-01-18", "2025-01-23", "2025-01-29",
        "2025-02-01", "2025-02-04", "2025-02-05", "2025-02-06",
        "2025-02-07", "2025-02-08", "2025-02-10", "2025-02-11",
        "2025-02-12", "2025-02-13", "2025-02-14", "2025-02-17",
        "2025-02-18", "2025-02-19", "2025-02-28",
        "2025-03-04", "2025-03-05", "2025-03-12", "2025-03-13"
    ]
};

// Gestion des onglets
function showTab(index) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    contents.forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
}

// Gestion du fichier
document.getElementById('uploadArea').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('uploadArea').addEventListener('dragover', (e) => {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
});

document.getElementById('uploadArea').addEventListener('dragleave', (e) => {
    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.05)';
});

document.getElementById('uploadArea').addEventListener('drop', (e) => {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.05)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.innerHTML = `📄 Fichier chargé: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    fileInfo.style.display = 'block';
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        consumptionData = data.map(row => {
            const dateDebut = parseDate(row['Date début'] || row['Date debut']);
            const dateFin = parseDate(row['Date fin']);
            const puissance = parseFloat((row['Valeur (kW)'] || row['Valeur (kW)']).toString().replace(',', '.'));
            
            // Calcul de la durée en heures
            const dureeMs = dateFin - dateDebut;
            const dureeHeures = dureeMs / (1000 * 60 * 60);
            
            // Calcul de la consommation en kWh
            const consommation = puissance * dureeHeures;
            
            return {
                dateDebut,
                dateFin,
                puissance,
                dureeHeures,
                consommation
            };
        }).filter(row => !isNaN(row.consommation) && row.consommation > 0);
        
        fileInfo.innerHTML += `<br>✅ ${consumptionData.length} relevés traités`;
        
    } catch (error) {
        fileInfo.innerHTML = `❌ Erreur lors du traitement: ${error.message}`;
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.toString().split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '00:00:00';
    
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                  parseInt(hour), parseInt(minute), parseInt(second) || 0);
}

function isHeureCreuse(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    // Vérifier toutes les périodes HC définies
    const hcPeriods = document.querySelectorAll('.hc-period');
    
    for (let period of hcPeriods) {
        const periodNum = period.dataset.period;
        const startInput = document.getElementById(`hcStart${parseInt(periodNum) + 1}`);
        const endInput = document.getElementById(`hcEnd${parseInt(periodNum) + 1}`);
        
        if (startInput && endInput) {
            const start = startInput.value;
            const end = endInput.value;
            
            // Gérer le cas où la période traverse minuit (ex: 22:00 à 06:00)
            if (start > end) {
                if (timeStr >= start || timeStr < end) {
                    return true;
                }
            } else {
                if (timeStr >= start && timeStr < end) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function isHeureCreuseTempo(date) {
    const hour = date.getHours();
    // Pour Tempo : HP de 6h00 à 22h00, HC de 22h00 à 6h00 le lendemain
    return hour < 6 || hour >= 22;
}

function addHCPeriod() {
    hcPeriodCount++;
    const container = document.getElementById('hcPeriods');
    
    const newPeriod = document.createElement('div');
    newPeriod.className = 'controls hc-period';
    newPeriod.dataset.period = hcPeriodCount - 1;
    
    newPeriod.innerHTML = `
        <div class="control-group">
            <label>Période HC ${hcPeriodCount} - Début</label>
            <input type="time" id="hcStart${hcPeriodCount}" value="12:00">
        </div>
        <div class="control-group">
            <label>Période HC ${hcPeriodCount} - Fin</label>
            <input type="time" id="hcEnd${hcPeriodCount}" value="14:00">
        </div>
        <div class="control-group">
            <button type="button" class="remove-period" onclick="removeHCPeriod(${hcPeriodCount - 1})" style="background: #e74c3c; margin-top: 25px;">❌ Supprimer</button>
        </div>
    `;
    
    container.appendChild(newPeriod);
}

function removeHCPeriod(periodIndex) {
    const periods = document.querySelectorAll('.hc-period');
    if (periods.length <= 1) {
        alert('Vous devez garder au moins une période');
        return;
    }
    
    const periodToRemove = document.querySelector(`.hc-period[data-period="${periodIndex}"]`);
    if (periodToRemove) {
        periodToRemove.remove();
    }
}

function toggleCustomMode() {
    const mode = document.getElementById('customMode').value;
    const hourlyMode = document.getElementById('hourlyMode');
    const weeklyMode = document.getElementById('weeklyMode');
    
    if (mode === 'hourly') {
        hourlyMode.style.display = 'block';
        weeklyMode.style.display = 'none';
    } else {
        hourlyMode.style.display = 'none';
        weeklyMode.style.display = 'block';
    }
}

function addCustomPeriod() {
    customPeriodCount++;
    const container = document.getElementById('customPeriods');
    
    const newPeriod = document.createElement('div');
    newPeriod.className = 'controls custom-period';
    newPeriod.dataset.period = customPeriodCount - 1;
    
    newPeriod.innerHTML = `
        <div class="control-group">
            <label>Période ${customPeriodCount} - Début</label>
            <input type="time" id="period${customPeriodCount}Start" value="12:00">
        </div>
        <div class="control-group">
            <label>Période ${customPeriodCount} - Fin</label>
            <input type="time" id="period${customPeriodCount}End" value="14:00">
        </div>
        <div class="control-group">
            <label>Prix Période ${customPeriodCount} (€/kWh)</label>
            <input type="number" id="period${customPeriodCount}Price" value="0.1800" step="0.0001">
        </div>
        <div class="control-group">
            <button type="button" onclick="removeCustomPeriod(${customPeriodCount - 1})" style="background: #e74c3c; margin-top: 25px;">❌ Supprimer</button>
        </div>
    `;
    
    container.appendChild(newPeriod);
}

function removeCustomPeriod(periodIndex) {
    const periods = document.querySelectorAll('.custom-period');
    if (periods.length <= 1) {
        alert('Vous devez garder au moins une période');
        return;
    }
    
    const periodToRemove = document.querySelector(`[data-period="${periodIndex}"]`);
    if (periodToRemove) {
        periodToRemove.remove();
    }
}

function getDayName(dayIndex) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
}

function isHeureCeuseForDay(date, dayName) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    const startInput = document.getElementById(`${dayName}HCStart`);
    const endInput = document.getElementById(`${dayName}HCEnd`);
    
    if (!startInput || !endInput) return false;
    
    const start = startInput.value;
    const end = endInput.value;
    
    // Gérer le cas où la période traverse minuit
    if (start > end) {
        return timeStr >= start || timeStr < end;
    } else {
        return timeStr >= start && timeStr < end;
    }
}

function getTempoColor(date) {
    const hour = date.getHours();
    
    // Calculer la date de référence en format YYYY-MM-DD local
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    
    // Si on est entre 00h00 et 06h00, utiliser le jour précédent
    if (hour < 6) {
        day = day - 1;
        // Gérer le passage au mois précédent
        if (day <= 0) {
            month = month - 1;
            if (month < 0) {
                month = 11;
                year = year - 1;
            }
            // Obtenir le dernier jour du mois précédent
            day = new Date(year, month + 1, 0).getDate();
        }
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (JOURS_TEMPO.Rouge.includes(dateStr)) return 'Rouge';
    if (JOURS_TEMPO.Blanc.includes(dateStr)) return 'Blanc';
    return 'Bleu';
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Fonction utilitaire pour calculer la période couverte par les données
function getDataPeriod(data) {
    if (data.length === 0) return { start: null, end: null, months: 0 };
    
    const dates = data.map(row => row.dateDebut).sort((a, b) => a - b);
    const start = dates[0];
    const end = dates[dates.length - 1];
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth()) + 1;
    
    return { start, end, months };
}

function groupData(data, level = 'month') {
    const grouped = {};
    
    data.forEach(row => {
        if (!row.dateDebut) return;
        
        let key;
        if (level === 'month') {
            key = `${row.dateDebut.getFullYear()}-${String(row.dateDebut.getMonth() + 1).padStart(2, '0')}`;
        } else if (level === 'week') {
            const weekNum = getWeekNumber(row.dateDebut);
            key = `${row.dateDebut.getFullYear()}-S${weekNum}`;
        } else if (level === 'day') {
            key = row.dateDebut.toISOString().split('T')[0];
        }
        
        if (!grouped[key]) {
            grouped[key] = {
                consommation: 0,
                cout: 0,
                details: level === 'month' ? {} : level === 'week' ? {} : [],
                // Détails pour HC/HP
                hcConsommation: 0,
                hpConsommation: 0,
                hcCout: 0,
                hpCout: 0,
                // Détails pour Tempo
                tempoDetails: { 
                    Bleu: { HC: { conso: 0, cout: 0 }, HP: { conso: 0, cout: 0 }, total: 0 },
                    Blanc: { HC: { conso: 0, cout: 0 }, HP: { conso: 0, cout: 0 }, total: 0 },
                    Rouge: { HC: { conso: 0, cout: 0 }, HP: { conso: 0, cout: 0 }, total: 0 }
                },
                // Détails pour personnalisé
                customDetails: {}
            };
        }
        
        grouped[key].consommation += row.consommation;
        grouped[key].cout += row.cout || 0;
        
        // Accumulation HC/HP
        if (row.periode === 'HC') {
            grouped[key].hcConsommation += row.consommation;
            grouped[key].hcCout += row.cout || 0;
        } else if (row.periode === 'HP') {
            grouped[key].hpConsommation += row.consommation;
            grouped[key].hpCout += row.cout || 0;
        }
        
        // Accumulation Tempo
        if (row.couleur && row.periode) {
            const periode = row.periode;
            grouped[key].tempoDetails[row.couleur][periode].conso += row.consommation;
            grouped[key].tempoDetails[row.couleur][periode].cout += row.cout || 0;
            grouped[key].tempoDetails[row.couleur].total += row.cout || 0;
        }
        
        // Accumulation personnalisé
        if (row.jour) {
            if (!grouped[key].customDetails[row.jour]) {
                grouped[key].customDetails[row.jour] = { HC: { conso: 0, cout: 0 }, HP: { conso: 0, cout: 0 } };
            }
            grouped[key].customDetails[row.jour][row.periode].conso += row.consommation;
            grouped[key].customDetails[row.jour][row.periode].cout += row.cout || 0;
        }
        
        if (level === 'day') {
            grouped[key].details.push(row);
        }
    });
    
    return grouped;
}

function displayResults(containerId, data, title, calculationType = 'simple') {
    const container = document.getElementById(containerId);
    const period = getDataPeriod(data);
    
    // Récupérer le coût d'abonnement selon le type de calcul
    let monthlySubscription = 0;
    let subscriptionFieldId = '';
    
    switch(calculationType) {
        case 'simple':
            subscriptionFieldId = 'simpleSubscription';
            break;
        case 'hchp':
            subscriptionFieldId = 'hchpSubscription';
            break;
        case 'custom':
            subscriptionFieldId = 'customSubscription';
            break;
        case 'tempo':
            subscriptionFieldId = 'tempoSubscription';
            break;
    }
    
    const subscriptionInput = document.getElementById(subscriptionFieldId);
    if (subscriptionInput) {
        monthlySubscription = parseFloat(subscriptionInput.value) || 0;
    }
    
    const totalSubscriptionCost = period.months * monthlySubscription;
    
    let html = `<h3>📊 ${title}</h3>`;
    
    // Affichage des informations sur l'abonnement
    if (monthlySubscription > 0) {
        html += `
            <div class="subscription-info">
                <div class="subscription-label">
                    💳 Abonnement: ${monthlySubscription.toFixed(2)} €/mois × ${period.months} mois
                </div>
                <div class="subscription-value">
                    Total abonnement: ${totalSubscriptionCost.toFixed(2)} €
                </div>
            </div>
        `;
    }
    
    // Affichage des résultats par mois
    const monthlyData = groupData(data, 'month');
    let totalConsumptionCost = 0;
    let totalConsumption = 0;
    
    Object.entries(monthlyData).forEach(([month, monthData]) => {
        totalConsumptionCost += monthData.cout;
        totalConsumption += monthData.consommation;
        
        const monthTotal = monthData.cout + monthlySubscription;
        
        html += `
            <div class="month-container">
                <div class="result-item month-header" onclick="toggleDetail('${containerId}_${month}')">
                    <span class="result-label">
                        📅 ${month} 
                        <span class="expand-icon">▼</span>
                    </span>
                    <div class="month-breakdown">
                        <div class="month-consumption">⚡ Conso: ${monthData.consommation.toFixed(2)} kWh - ${monthData.cout.toFixed(2)} €</div>
                        ${monthlySubscription > 0 ? `<div class="month-subscription">💳 Abonnement: ${monthlySubscription.toFixed(2)} €</div>` : ''}
                        <div class="month-total"><strong>Total: ${monthTotal.toFixed(2)} €</strong></div>
                    </div>
                </div>
                
                ${generateMonthDetails(monthData, calculationType)}
                
                <div id="${containerId}_${month}" class="detail-container">
                    ${generateWeeklyDetails(data, month, containerId)}
                </div>
            </div>
        `;
    });
    
    // Total avec abonnement
    const grandTotal = totalConsumptionCost + totalSubscriptionCost;
    
    html += `
        <div class="result-item total">
            <span class="result-label">🎯 TOTAL COMPLET</span>
            <div class="total-breakdown">
                <div class="total-line consumption">
                    <span>Consommation: ${totalConsumption.toFixed(2)} kWh</span>
                    <span>${totalConsumptionCost.toFixed(2)} €</span>
                </div>
                ${monthlySubscription > 0 ? `
                <div class="total-line subscription">
                    <span>Abonnement (${period.months} mois)</span>
                    <span>${totalSubscriptionCost.toFixed(2)} €</span>
                </div>
                ` : ''}
                <div class="total-line final">
                    <span><strong>TOTAL</strong></span>
                    <span><strong>${grandTotal.toFixed(2)} €</strong></span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
}

function generateMonthDetails(monthData, calculationType) {
    if (calculationType === 'simple') return '';
    
    let html = '<div class="month-details">';
    
    if (calculationType === 'hchp') {
        html += `
            <div class="tariff-grid">
                <div class="tariff-card hc-card">
                    <div class="tariff-icon">🌙</div>
                    <div class="tariff-label">Heures Creuses</div>
                    <div class="tariff-value">${monthData.hcConsommation.toFixed(2)} kWh</div>
                    <div class="tariff-cost">${monthData.hcCout.toFixed(2)} €</div>
                </div>
                <div class="tariff-card hp-card">
                    <div class="tariff-icon">☀️</div>
                    <div class="tariff-label">Heures Pleines</div>
                    <div class="tariff-value">${monthData.hpConsommation.toFixed(2)} kWh</div>
                    <div class="tariff-cost">${monthData.hpCout.toFixed(2)} €</div>
                </div>
            </div>
        `;
    } else if (calculationType === 'tempo') {
        html += `
            <div class="tariff-grid tempo-grid">
                <div class="tariff-card tempo-bleu-card">
                    <div class="tariff-icon">🔵</div>
                    <div class="tariff-label">Jours Bleus</div>
                    <div class="tariff-breakdown">
                        <div class="hc-hp-detail">
                            <span>HC: ${monthData.tempoDetails.Bleu.HC.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Bleu.HC.cout.toFixed(2)} €</span>
                            <span>HP: ${monthData.tempoDetails.Bleu.HP.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Bleu.HP.cout.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div class="tariff-total">${monthData.tempoDetails.Bleu.total.toFixed(2)} €</div>
                </div>
                
                <div class="tariff-card tempo-blanc-card">
                    <div class="tariff-icon">⚪</div>
                    <div class="tariff-label">Jours Blancs</div>
                    <div class="tariff-breakdown">
                        <div class="hc-hp-detail">
                            <span>HC: ${monthData.tempoDetails.Blanc.HC.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Blanc.HC.cout.toFixed(2)} €</span>
                            <span>HP: ${monthData.tempoDetails.Blanc.HP.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Blanc.HP.cout.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div class="tariff-total">${monthData.tempoDetails.Blanc.total.toFixed(2)} €</div>
                </div>
                
                <div class="tariff-card tempo-rouge-card">
                    <div class="tariff-icon">🔴</div>
                    <div class="tariff-label">Jours Rouges</div>
                    <div class="tariff-breakdown">
                        <div class="hc-hp-detail">
                            <span>HC: ${monthData.tempoDetails.Rouge.HC.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Rouge.HC.cout.toFixed(2)} €</span>
                            <span>HP: ${monthData.tempoDetails.Rouge.HP.conso.toFixed(1)} kWh - ${monthData.tempoDetails.Rouge.HP.cout.toFixed(2)} €</span>
                        </div>
                    </div>
                    <div class="tariff-total">${monthData.tempoDetails.Rouge.total.toFixed(2)} €</div>
                </div>
            </div>
        `;
    } else if (calculationType === 'custom') {
        if (Object.keys(monthData.customDetails).length > 0) {
            html += `<div class="tariff-grid custom-grid">`;
            
            const dayNames = {
                'monday': 'Lundi', 'tuesday': 'Mardi', 'wednesday': 'Mercredi',
                'thursday': 'Jeudi', 'friday': 'Vendredi', 'saturday': 'Samedi', 'sunday': 'Dimanche'
            };
            
            Object.entries(monthData.customDetails).forEach(([day, dayData]) => {
                const isWeekend = day === 'saturday' || day === 'sunday';
                const cardClass = isWeekend ? 'custom-weekend-card' : 'custom-weekday-card';
                
                html += `
                    <div class="tariff-card ${cardClass}">
                        <div class="tariff-icon">${isWeekend ? '🌴' : '💼'}</div>
                        <div class="tariff-label">${dayNames[day] || day}</div>
                        <div class="tariff-breakdown">
                            <div class="hc-hp-detail">
                                <span>HC: ${dayData.HC.cout.toFixed(2)} €</span>
                                <span>HP: ${dayData.HP.cout.toFixed(2)} €</span>
                            </div>
                        </div>
                        <div class="tariff-total">${(dayData.HC.cout + dayData.HP.cout).toFixed(2)} €</div>
                    </div>
                `;
            });
            
            html += '</div>';
        } else {
            html += `
                <div class="tariff-grid">
                    <div class="tariff-card custom-hourly-card">
                        <div class="tariff-icon">⏰</div>
                        <div class="tariff-label">Périodes Horaires</div>
                        <div class="tariff-value">${monthData.consommation.toFixed(2)} kWh</div>
                        <div class="tariff-cost">${monthData.cout.toFixed(2)} €</div>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

function generateWeeklyDetails(data, month, containerId) {
    const [year, monthNum] = month.split('-');
    const monthData = data.filter(row => {
        const rowMonth = `${row.dateDebut.getFullYear()}-${String(row.dateDebut.getMonth() + 1).padStart(2, '0')}`;
        return rowMonth === month;
    });
    
    const weeklyData = groupData(monthData, 'week');
    let html = '<h4>📅 Détail par semaine:</h4>';
    
    Object.entries(weeklyData).forEach(([week, weekData]) => {
        html += `
            <div class="detail-item" onclick="toggleDetail('${containerId}_${week}')">
                <span>
                    📆 ${week} 
                    <span class="expand-icon">▼</span>
                </span>
                <span>${weekData.consommation.toFixed(2)} kWh - ${weekData.cout.toFixed(2)} €</span>
            </div>
            <div id="${containerId}_${week}" class="detail-container">
                ${generateDailyDetails(monthData, week, containerId)}
            </div>
        `;
    });
    
    return html;
}

function generateDailyDetails(data, week, containerId) {
    const [year, weekStr] = week.split('-S');
    const weekNum = parseInt(weekStr);
    
    const weekData = data.filter(row => {
        return getWeekNumber(row.dateDebut) === weekNum && 
               row.dateDebut.getFullYear() === parseInt(year);
    });
    
    const dailyData = groupData(weekData, 'day');
    let html = '<h5>📋 Détail par jour:</h5>';
    
    Object.entries(dailyData).forEach(([day, dayData]) => {
        const date = new Date(day);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        html += `
            <div class="detail-item">
                <span>📅 ${dayName} ${day}</span>
                <span>${dayData.consommation.toFixed(2)} kWh - ${dayData.cout.toFixed(2)} €</span>
            </div>
        `;
    });
    
    return html;
}

function toggleDetail(elementId) {
    const element = document.getElementById(elementId);
    const parentItem = element.previousElementSibling;
    
    if (element.style.display === 'block') {
        element.style.display = 'none';
        parentItem.classList.remove('expanded');
    } else {
        element.style.display = 'block';
        parentItem.classList.add('expanded');
    }
}

function calculateSimple() {
    if (consumptionData.length === 0) {
        alert('Veuillez charger un fichier de données');
        return;
    }
    
    const price = parseFloat(document.getElementById('simplePrice').value);
    const subscription = parseFloat(document.getElementById('simpleSubscription').value) || 0;
    const period = getDataPeriod(consumptionData);
    
    const processedData = consumptionData.map(row => ({
        ...row,
        cout: row.consommation * price
    }));
    
    const totalConsumptionCost = processedData.reduce((sum, row) => sum + row.cout, 0);
    const totalSubscriptionCost = period.months * subscription;
    
    calculatedResults.simple = { 
        data: processedData, 
        total: totalConsumptionCost + totalSubscriptionCost,
        consumptionCost: totalConsumptionCost,
        subscriptionCost: totalSubscriptionCost
    };
    
    displayResults('simpleResults', processedData, 'Résultats Tarif Simple', 'simple');
}

function calculateHCHP() {
    if (consumptionData.length === 0) {
        alert('Veuillez charger un fichier de données');
        return;
    }
    
    const hpPrice = parseFloat(document.getElementById('hpPrice').value);
    const hcPrice = parseFloat(document.getElementById('hcPrice').value);
    const subscription = parseFloat(document.getElementById('hchpSubscription').value) || 0;
    const period = getDataPeriod(consumptionData);
    
    const processedData = consumptionData.map(row => {
        const isHC = isHeureCreuse(row.dateDebut);
        const price = isHC ? hcPrice : hpPrice;
        return {
            ...row,
            cout: row.consommation * price,
            periode: isHC ? 'HC' : 'HP'
        };
    });
    
    const totalConsumptionCost = processedData.reduce((sum, row) => sum + row.cout, 0);
    const totalSubscriptionCost = period.months * subscription;
    
    calculatedResults.hchp = { 
        data: processedData, 
        total: totalConsumptionCost + totalSubscriptionCost,
        consumptionCost: totalConsumptionCost,
        subscriptionCost: totalSubscriptionCost
    };
    
    displayResults('hchpResults', processedData, 'Résultats Heures Creuses/Pleines', 'hchp');
}

function calculateCustom() {
    if (consumptionData.length === 0) {
        alert('Veuillez charger un fichier de données');
        return;
    }
    
    const mode = document.getElementById('customMode').value;
    const subscription = parseFloat(document.getElementById('customSubscription').value) || 0;
    const period = getDataPeriod(consumptionData);
    let processedData;
    
    if (mode === 'hourly') {
        // Mode horaire - récupérer toutes les périodes définies
        const periods = [];
        const customPeriods = document.querySelectorAll('.custom-period');
        
        customPeriods.forEach((period, index) => {
            const periodNum = index + 1;
            const startInput = document.getElementById(`period${periodNum}Start`);
            const endInput = document.getElementById(`period${periodNum}End`);
            const priceInput = document.getElementById(`period${periodNum}Price`);
            
            if (startInput && endInput && priceInput) {
                periods.push({
                    start: startInput.value,
                    end: endInput.value,
                    price: parseFloat(priceInput.value)
                });
            }
        });
        
        processedData = consumptionData.map(row => {
            const hour = row.dateDebut.getHours();
            const minute = row.dateDebut.getMinutes();
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            let price = periods[0]?.price || 0.2016; // prix par défaut
            
            for (let period of periods) {
                // Gérer le cas où la période traverse minuit
                if (period.start > period.end) {
                    if (timeStr >= period.start || timeStr < period.end) {
                        price = period.price;
                        break;
                    }
                } else {
                    if (timeStr >= period.start && timeStr < period.end) {
                        price = period.price;
                        break;
                    }
                }
            }
            
            return {
                ...row,
                cout: row.consommation * price
            };
        });
    } else {
        // Mode hebdomadaire
        processedData = consumptionData.map(row => {
            const dayIndex = row.dateDebut.getDay();
            const dayName = getDayName(dayIndex);
            
            const isHC = isHeureCeuseForDay(row.dateDebut, dayName);
            const hcPriceInput = document.getElementById(`${dayName}HC`);
            const hpPriceInput = document.getElementById(`${dayName}HP`);
            
            const hcPrice = hcPriceInput ? parseFloat(hcPriceInput.value) : 0.1696;
            const hpPrice = hpPriceInput ? parseFloat(hpPriceInput.value) : 0.2146;
            
            const price = isHC ? hcPrice : hpPrice;
            
            return {
                ...row,
                cout: row.consommation * price,
                periode: isHC ? 'HC' : 'HP',
                jour: dayName
            };
        });
    }
    
    const totalConsumptionCost = processedData.reduce((sum, row) => sum + row.cout, 0);
    const totalSubscriptionCost = period.months * subscription;
    
    calculatedResults.custom = { 
        data: processedData, 
        total: totalConsumptionCost + totalSubscriptionCost,
        consumptionCost: totalConsumptionCost,
        subscriptionCost: totalSubscriptionCost
    };
    
    const title = mode === 'hourly' ? 'Résultats Tarification Horaire' : 'Résultats Tarification Hebdomadaire';
    displayResults('customResults', processedData, title, 'custom');
}

function calculateTempo() {
    if (consumptionData.length === 0) {
        alert('Veuillez charger un fichier de données');
        return;
    }
    
    const prices = {
        'Bleu': {
            HP: parseFloat(document.getElementById('tempoBleuHP').value),
            HC: parseFloat(document.getElementById('tempoBleuHC').value)
        },
        'Blanc': {
            HP: parseFloat(document.getElementById('tempoBlancHP').value),
            HC: parseFloat(document.getElementById('tempoBlancHC').value)
        },
        'Rouge': {
            HP: parseFloat(document.getElementById('tempoRougeHP').value),
            HC: parseFloat(document.getElementById('tempoRougeHC').value)
        }
    };
    
    const subscription = parseFloat(document.getElementById('tempoSubscription').value) || 0;
    const period = getDataPeriod(consumptionData);
    
    const processedData = consumptionData.map(row => {
        const color = getTempoColor(row.dateDebut);
        const isHC = isHeureCreuseTempo(row.dateDebut);
        const price = prices[color][isHC ? 'HC' : 'HP'];
        
        return {
            ...row,
            cout: row.consommation * price,
            couleur: color,
            periode: isHC ? 'HC' : 'HP'
        };
    });
    
    const totalConsumptionCost = processedData.reduce((sum, row) => sum + row.cout, 0);
    const totalSubscriptionCost = period.months * subscription;
    
    calculatedResults.tempo = { 
        data: processedData, 
        total: totalConsumptionCost + totalSubscriptionCost,
        consumptionCost: totalConsumptionCost,
        subscriptionCost: totalSubscriptionCost
    };
    
    displayResults('tempoResults', processedData, 'Résultats Tarification Tempo', 'tempo');
}

function calculateComparison() {
    if (consumptionData.length === 0) {
        alert('Veuillez charger un fichier de données');
        return;
    }
    
    // Lancer automatiquement tous les calculs
    console.log('Calcul automatique de tous les tarifs...');
    
    // Calculer tous les tarifs
    calculateSimple();
    calculateHCHP();
    calculateCustom();
    calculateTempo();
    
    // Vérifier qu'on a au moins un résultat
    if (Object.keys(calculatedResults).length === 0) {
        alert('Erreur lors du calcul des tarifs');
        return;
    }
    
    const container = document.getElementById('comparisonResults');
    let html = `
        <h3>📊 Comparaison des Tarifs</h3>
        <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #2e7d32; margin: 0; font-weight: 600;">
                ✅ Tous les tarifs ont été calculés automatiquement pour la comparaison
            </p>
        </div>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Tarif</th>
                    <th>Coût Consommation (€)</th>
                    <th>Coût Abonnement (€)</th>
                    <th>Coût Total (€)</th>
                    <th>Économie vs Tarif Simple</th>
                    <th>Rang</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const results = [];
    
    if (calculatedResults.simple) {
        results.push({ 
            name: 'Tarif Simple', 
            total: calculatedResults.simple.total,
            consumption: calculatedResults.simple.consumptionCost,
            subscription: calculatedResults.simple.subscriptionCost
        });
    }
    if (calculatedResults.hchp) {
        results.push({ 
            name: 'Heures Creuses/Pleines', 
            total: calculatedResults.hchp.total,
            consumption: calculatedResults.hchp.consumptionCost,
            subscription: calculatedResults.hchp.subscriptionCost
        });
    }
    if (calculatedResults.custom) {
        results.push({ 
            name: 'Tarification Personnalisée', 
            total: calculatedResults.custom.total,
            consumption: calculatedResults.custom.consumptionCost,
            subscription: calculatedResults.custom.subscriptionCost
        });
    }
    if (calculatedResults.tempo) {
        results.push({ 
            name: 'Tempo', 
            total: calculatedResults.tempo.total,
            consumption: calculatedResults.tempo.consumptionCost,
            subscription: calculatedResults.tempo.subscriptionCost
        });
    }
    
    // Trier par coût total croissant
    results.sort((a, b) => a.total - b.total);
    
    const simpleCost = calculatedResults.simple ? calculatedResults.simple.total : results[0].total;
    
    results.forEach((result, index) => {
        const saving = simpleCost - result.total;
        const savingPercent = ((saving / simpleCost) * 100).toFixed(1);
        const isBest = index === 0;
        
        html += `
            <tr ${isBest ? 'class="best-option"' : ''}>
                <td>${result.name} ${isBest ? '🏆' : ''}</td>
                <td>${result.consumption.toFixed(2)} €</td>
                <td>${result.subscription.toFixed(2)} €</td>
                <td>${result.total.toFixed(2)} €</td>
                <td>${saving >= 0 ? '+' : ''}${saving.toFixed(2)} € (${savingPercent}%)</td>
                <td>${index + 1}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div style="background: #f0f8ff; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <h4 style="color: #1976d2; margin-bottom: 10px;">💡 Conseils</h4>
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
                • Le meilleur tarif est surligné en vert avec le trophée 🏆<br>
                • Les économies sont calculées par rapport au tarif simple<br>
                • N'hésitez pas à ajuster les paramètres et recalculer pour optimiser vos économies
            </p>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    console.log('Comparaison terminée avec', results.length, 'tarifs');
}
