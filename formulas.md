# Work Sampling Formulas (Chapter Six)

Below is the complete compilation of all mathematical formulas extracted from the text for conducting a Work Sampling analysis.

### 1. Preliminary Parameters
**Proportion of Time Busy ($P$)**
Used to determine the initial study parameter during the preliminary observation stage.
$$P = \frac{\text{Number of times staff were found busy}}{\text{Total Number of observations for all observed staff}} \quad \text{(Eq. 6.1)}$$

---

### 2. Number of Observations Required
**General Formula ($N$)**
Determines the total number of observations required for the main study based on desired statistical accuracy.
$$N = \frac{K^2(1 - P)}{A^2P} \quad \text{(Eq. 6.2)}$$
*Where $K$ is the number of standard deviations from the mean, and $A$ is the desired relative accuracy.*

**Standard Simplification**
Assuming standard parameters ($K=2$, $A=5\%$, and a $95\%$ confidence limit):
$$N = \frac{4}{(0.05)^2} \left( \frac{1 - P}{P} \right) = 1600 \left( \frac{1 - P}{P} \right) \quad \text{(Eq. 6.3)}$$

---

### 3. Random Schedule Generation
**Picking Random Observation Days ($x_i$)**
To randomly select the date of observation within a month, where $R_i$ is a random number between $0$ and $1.0$:
*   **For February:** $$x_i = 1.0 + 27R_i \quad \text{(Eq. 6.4)}$$
*   **For April, June, September, November:** $$x_i = 1.0 + 29R_i \quad \text{(Eq. 6.5)}$$
*   **For January, March, May, July, August, October, December:** $$x_i = 1.0 + 30R_i \quad \text{(Eq. 6.6)}$$

**Maximum Cycle Duration ($B$)**
For $n$ observations per day of $W$ working minutes:
$$\frac{A + B}{2} = \frac{W}{n} \quad \text{(Eq. 6.8)}$$
For a standard 8-hour working day ($W = 480$ minutes):
$$B = \frac{960 - nA}{n} \quad \text{(Eq. 6.9)}$$
*Where $A$ is the minimum duration considered sufficient for observation and rest per cycle (in minutes).*

**Scheduled Observation Times ($Y_i$)**
$$Y_i = Y_{i-1} + [A + (B - A)R_i] \quad \text{(Eq. 6.7)}$$
*Where $Y_0$ is the clock time when work commences in the establishment.*

---

### 4. Data Analysis
These formulas are applied sequentially to the collected observation data for each specific position $i$.

**Utilisation Factor ($U_i$)**
$$U_i = \frac{\text{Number of observed busy mode for position } i}{\text{Total number of observations}} \quad \text{(Eq. 6.11)}$$

**Estimated Annual Man-hours ($EAM_i$)**
$$EAM_i = U_i \times [\text{Available hours of work in the year}] \quad \text{(Eq. 6.12)}$$

**Estimated Basic Man-hours ($EBM_i$)**
$$EBM_i = EAM_i \times \frac{\text{Performance Rating in position } i}{100} \quad \text{(Eq. 6.13)}$$

**Estimated Standard Man-hours ($ESM_i$)**
$$ESM_i = EBM_i + \frac{EBM_i \times PA_i}{100} \quad \text{(Eq. 6.14)}$$
*Where $PA_i$ is the percentage allowance for the type of job done in position $i$.*

**Total Available Standard Man-hours ($TAM$)**
For all $M$ operational positions in the establishment:
$$TAM = \sum_{i=1}^{M} ESM_i \quad \text{(Eq. 6.15)}$$
