import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const electricityLesson: PhysicsLessonConfig = {
  id: "electricity",
  class: 10,
  subject: "Science",
  chapter: "Electricity",
  title: "Complete Electricity: Ohm's Law, Circuits, Heating & Power",
  subtitle: "Interactive DC circuit laboratory covering Electric Charge, Current, Potential Difference, Ohm's Law, Series & Parallel Resistors, Joule's Heating and Electric Power.",
  slug: "/class-10/science/physics/electricity/",
  simulation: "electricity",
  model: "/assets/physics/electricity/circuit-board.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D DC circuit board & Ohm's Law solver active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: false,
    cameraPosition: { x: 0, y: 6.4, z: 7.4 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    minDistance: 4,
    maxDistance: 18,
  },
  cameraPresets: [
    { id: "perspective", label: "3D Bench View", position: { x: 0, y: 6.4, z: 7.4 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top-down", label: "Top Circuit Diagram", position: { x: 0, y: 9.8, z: 0.2 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: {
    voltageV: 12,
    resistor1Ohm: 4,
    resistor2Ohm: 6,
    resistorCount: 2,
    topology: "series",
    switchClosed: true,
  },
  parameterControls: [
    { key: "switchClosed", label: "Circuit Switch (ON / OFF)", type: "toggle", defaultValue: true },
    {
      key: "topology",
      label: "Resistor Combination",
      type: "select",
      options: [
        { value: "series", label: "Series (R_s = R₁ + R₂ + ...)" },
        { value: "parallel", label: "Parallel (1/R_p = 1/R₁ + 1/R₂ + ...)" },
      ],
      defaultValue: "series",
    },
    { key: "voltageV", label: "Battery Voltage (V)", type: "range", min: 2, max: 24, step: 1, unit: " V", defaultValue: 12 },
    { key: "resistor1Ohm", label: "Resistor R₁", type: "range", min: 2, max: 20, step: 1, unit: " Ω", defaultValue: 4 },
    { key: "resistor2Ohm", label: "Resistor R₂", type: "range", min: 2, max: 20, step: 1, unit: " Ω", defaultValue: 6 },
    { key: "resistorCount", label: "Number of Resistors", type: "range", min: 1, max: 3, step: 1, unit: "", defaultValue: 2 },
  ],
  animationClips: [{ id: "current-flow", label: "Charge Carrier Flow", duration: 4.0 }],
  learningSteps: [
    {
      stepNumber: 1,
      title: "Electric Charge, Current & Potential (Q = ne, I = Q/t, V = W/Q)",
      description: "1 Coulomb contains 6.25 × 10¹⁸ electrons (e = 1.6 × 10⁻¹⁹ C). Electric current I is rate of charge flow in Amperes, measured by an Ammeter in series. Potential difference V = W/Q is measured by a Voltmeter in parallel.",
      focusObject: "Battery",
      simulationParams: { resistorCount: 1, voltageV: 12, resistor1Ohm: 6, switchClosed: true }
    },
    {
      stepNumber: 2,
      title: "Ohm's Law & V-I Graph Linearity (V = I · R)",
      description: "At constant temperature, current I ∝ potential difference V. Resistance R = V/I (Ohms). The slope of the straight-line V-I graph equals the resistance of the ohmic conductor.",
      focusObject: "Resistor_1",
      simulationParams: { resistorCount: 1, voltageV: 12, resistor1Ohm: 6, switchClosed: true }
    },
    {
      stepNumber: 3,
      title: "Factors Affecting Resistance & Wire Stretching (R = ρ·l/A)",
      description: "Resistance is directly proportional to length l and inversely proportional to area A (or radius r²). When a wire is stretched to double its length (l' = 2l), its area halves (A' = A/2) and resistance quadruples (R' = 4R), while resistivity ρ stays constant.",
      focusObject: "Resistor_1",
      simulationParams: { resistorCount: 1, voltageV: 12, resistor1Ohm: 12, switchClosed: true }
    },
    {
      stepNumber: 4,
      title: "Resistors in Series Combination (R_s = R₁ + R₂, Constant Current)",
      description: "In series, identical current I flows through all resistors while total voltage divides (V = V₁ + V₂). Equivalent resistance R_s is greater than any individual resistance, reducing overall circuit current.",
      focusObject: "Resistor_1",
      simulationParams: { resistorCount: 2, topology: "series", voltageV: 12, resistor1Ohm: 4, resistor2Ohm: 6, switchClosed: true }
    },
    {
      stepNumber: 5,
      title: "Resistors in Parallel Combination (1/R_p = 1/R₁ + 1/R₂, Constant Voltage)",
      description: "In parallel, each branch receives the full voltage V while current divides (I = I₁ + I₂). Equivalent resistance R_p drops below the smallest resistor, maximizing current and power. Domestic wiring uses parallel connection.",
      focusObject: "Bulb",
      simulationParams: { resistorCount: 2, topology: "parallel", voltageV: 12, resistor1Ohm: 4, resistor2Ohm: 6, switchClosed: true }
    },
    {
      stepNumber: 6,
      title: "Joule's Heating Effect & Electric Power (H = I²Rt, P = VI = V²/R)",
      description: "Collisions of drifting electrons dissipate thermal energy H = I²Rt. Electric power P = VI = I²R = V²/R (Watts). Commercial electrical energy: 1 kWh = 3.6 × 10⁶ Joules. Heating appliances use Nichrome alloys; fuses have low melting points.",
      focusObject: "Bulb",
      simulationParams: { resistorCount: 2, topology: "parallel", voltageV: 16, resistor1Ohm: 4, resistor2Ohm: 6, switchClosed: true }
    },
  ],
  objects: [
    { id: "battery", meshName: "Battery", name: "DC Battery", description: "Source of electric potential difference V (in Volts).", function: "Maintains electric potential difference across circuit terminals by chemical action.", labelOffset: { x: -0.6, y: 1.0, z: 0 } },
    { id: "switch", meshName: "Switch", name: "Plug Key / Switch", description: "Controls circuit continuity.", function: "Closes or opens the conducting path without affecting circuit resistance.", labelOffset: { x: 0, y: 0.7, z: 0.4 } },
    { id: "ammeter", meshName: "Ammeter", name: "Ammeter (A)", description: "Low-resistance meter connected strictly in SERIES.", function: "Measures total electric current I in Amperes. Low resistance ensures it does not alter circuit current.", cbseNote: "CBSE Board PYQ: Why is an ammeter connected in series? Because its extremely low resistance ensures negligible drop in current.", labelOffset: { x: 0, y: 0.8, z: -0.4 } },
    { id: "voltmeter", meshName: "Voltmeter", name: "Voltmeter (V)", description: "High-resistance meter connected strictly in PARALLEL.", function: "Measures potential difference V across components. Very high resistance prevents drawing significant current.", cbseNote: "CBSE Board PYQ: Why is a voltmeter connected in parallel? Because its high resistance ensures it draws negligible current from the main branch.", labelOffset: { x: 0, y: 0.8, z: 0.4 } },
    { id: "resistor1", meshName: "Resistor_1", name: "Resistor R₁", description: "Ohmic conductor offering electrical resistance R₁ (in Ohms Ω).", function: "Opposes charge flow and dissipates heat H = I²Rt according to Joule's law.", labelOffset: { x: 0, y: 0.8, z: -0.4 } },
    { id: "bulb", meshName: "Bulb", name: "Electric Bulb (Load)", description: "Tungsten filament load whose brightness reflects Electric Power P = VI = I²R.", function: "Converts electrical energy into light and thermal radiation. Tungsten has a high melting point (3380°C).", labelOffset: { x: 0.5, y: 1.1, z: 0 } },
  ],
  formulas: [
    { id: "quantization-current", name: "Charge & Current", expression: "Q = n·e  |  I = Q / t", variables: "e = 1.6 × 10⁻¹⁹ C, I in Amperes (A), Q in Coulombs (C)" },
    { id: "potential-diff", name: "Potential Difference", expression: "V = W / Q", variables: "W in Joules (J), Q in Coulombs (C), V in Volts (V)" },
    { id: "ohms-law", name: "Ohm's Law & Resistance", expression: "V = I · R  ⟹  R = V / I", variables: "V in Volts, I in Amperes, R in Ohms (Ω)" },
    { id: "resistivity-dim", name: "Resistivity & Dimensions", expression: "R = ρ · (l / A) = ρ · (l / πr²)", variables: "ρ in Ω·m, l in meters (m), A in m²" },
    { id: "series-parallel", name: "Resistor Combinations", expression: "Series: R_s = ΣRᵢ  |  Parallel: 1/R_p = Σ(1/Rᵢ)", variables: "Series: I constant; Parallel: V constant" },
    { id: "power-joules-heat", name: "Power & Joule's Heating", expression: "P = V·I = I²R = V²/R  |  H = I²Rt", variables: "P in Watts (W), H in Joules (J), 1 kWh = 3.6 × 10⁶ J" },
  ],
  cbseExamNotes: [
    "Wire Stretching Trick: If a wire is stretched to n times its length, its new resistance is R' = n² · R (Volume is constant, so area reduces to A/n). Its resistivity ρ remains unchanged.",
    "Household appliances are connected in PARALLEL so each receives full 220 V mains supply and operates independently.",
    "Commercial Unit of Electrical Energy: 1 Unit = 1 Kilowatt-hour (kWh) = 1000 W × 3600 s = 3.6 × 10⁶ Joules.",
    "Electric Fuse: Safety device made of lead-tin alloy with low melting point, always connected in series with the live wire.",
    "Why Nichrome for Heating Elements: High resistivity, high melting point, and does not oxidize (burn) at red-hot temperatures.",
    "Why Tungsten for Bulb Filaments: Extremely high melting point (3380°C) and high tensile strength to glow white-hot without melting.",
  ],
  quiz: [
    {
      id: "el-q1",
      question: "A current of 0.5 A is drawn by a filament of an electric bulb for 10 minutes. Find the amount of electric charge that flows through the circuit.",
      options: ["300 C", "5 C", "50 C", "30 C"],
      correctIndex: 0,
      explanation: "Given I = 0.5 A, t = 10 min = 10 × 60 = 600 s. Charge Q = I · t = 0.5 × 600 = 300 C.",
      marks: 1
    },
    {
      id: "el-q2",
      question: "Calculate the number of electrons constituting one Coulomb of electric charge.",
      options: ["6.25 × 10¹⁸ electrons", "1.6 × 10¹⁹ electrons", "6.25 × 10⁻¹⁸ electrons", "1.6 × 10⁻¹⁹ electrons"],
      correctIndex: 0,
      explanation: "Q = n · e ⟹ n = Q / e = 1 / (1.6 × 10⁻¹⁹ C) = 6.25 × 10¹⁸ electrons.",
      marks: 1
    },
    {
      id: "el-q3",
      question: "How much work is done in moving a charge of 2 C across two points having a potential difference of 12 V?",
      options: ["24 J", "6 J", "10 J", "48 J"],
      correctIndex: 0,
      explanation: "Potential difference V = W / Q ⟹ Work W = V · Q = 12 V × 2 C = 24 Joules.",
      marks: 1
    },
    {
      id: "el-q4",
      question: "An electric heater draws a current of 4 A from a 60 V source. What current will the heater draw if the potential difference is increased to 120 V?",
      options: ["8 A", "2 A", "16 A", "4 A"],
      correctIndex: 0,
      explanation: "Resistance R = V / I = 60 V / 4 A = 15 Ω. When V' = 120 V, new current I' = V' / R = 120 V / 15 Ω = 8 A (Doubling voltage doubles current by Ohm's law).",
      marks: 1
    },
    {
      id: "el-q5",
      question: "A cylindrical wire of resistance R is stretched to double its original length. What will be its new resistance?",
      options: ["4 R", "2 R", "R / 2", "R / 4"],
      correctIndex: 0,
      explanation: "Since volume V = A · l remains constant, doubling length (l' = 2l) causes cross-sectional area to halve (A' = A/2). New resistance R' = ρ(2l) / (A/2) = 4 · [ρl / A] = 4 R. Resistivity ρ remains unchanged.",
      marks: 1
    },
    {
      id: "el-q6",
      question: "How can three resistors of 2 Ω, 3 Ω, and 6 Ω be connected to give an equivalent resistance of 4 Ω?",
      options: [
        "Connect 3 Ω and 6 Ω in parallel, and then in series with 2 Ω",
        "Connect 2 Ω and 3 Ω in series, and then in parallel with 6 Ω",
        "Connect all three in series",
        "Connect all three in parallel"
      ],
      correctIndex: 0,
      explanation: "For 3 Ω and 6 Ω in parallel: 1/R_p = 1/3 + 1/6 = 3/6 = 1/2 ⟹ R_p = 2 Ω. Connecting R_p = 2 Ω in series with the remaining 2 Ω gives R_total = 2 + 2 = 4 Ω.",
      marks: 1
    },
    {
      id: "el-q7",
      question: "A piece of wire of resistance R is cut into 5 equal parts. These parts are then connected in parallel. If the equivalent resistance of this combination is R', what is the ratio R / R'?",
      options: ["25", "5", "1 / 5", "1 / 25"],
      correctIndex: 0,
      explanation: "Each part has resistance r = R / 5. Connecting 5 such parts in parallel gives 1/R' = 5 × (1 / r) = 5 / (R / 5) = 25 / R ⟹ R' = R / 25 ⟹ R / R' = 25.",
      marks: 1
    },
    {
      id: "el-q8",
      question: "An electric bulb is rated 220 V and 100 W. When it is operated on 110 V, the power consumed will be:",
      options: ["25 W", "50 W", "75 W", "100 W"],
      correctIndex: 0,
      explanation: "Resistance of the bulb filament is constant: R = V² / P = (220)² / 100 = 484 Ω. At 110 V: P' = V'² / R = (110)² / 484 = 12,100 / 484 = 25 W (Power scales with V²).",
      marks: 1
    },
    {
      id: "el-q9",
      question: "An electric heater of resistance 8 Ω draws 15 A from the service mains for 2 hours. Calculate the rate at which heat is developed in the heater.",
      options: ["1800 J/s", "3600 J/s", "120 J/s", "14,400 J/s"],
      correctIndex: 0,
      explanation: "Rate of heat development is Electric Power P = I² · R = (15 A)² × 8 Ω = 225 × 8 = 1800 Joules/second (Watts). Time (2 hours) is not multiplied because rate (per second) is asked.",
      marks: 1
    },
    {
      id: "el-q10",
      question: "An electric refrigerator rated 400 W operates 8 hours/day. What is the cost of the energy to operate it for 30 days at ₹3.00 per kWh?",
      options: ["₹288", "₹96", "₹864", "₹144"],
      correctIndex: 0,
      explanation: "Total energy E = Power × Time = 400 W × (8 h/day × 30 days) = 400 W × 240 h = 96,000 Wh = 96 kWh (Units). Cost = 96 kWh × ₹3.00 = ₹288.",
      marks: 1
    },
  ],
};
