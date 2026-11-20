/* Lab Guide — one shared helper for every simulation on the site.
   Adds a "Guide" button that opens a panel with two sides:
   Students: the big idea, a "Try this" checklist (ticks are remembered on this device), words to know.
   Teachers: learning goals, a 15-minute lesson flow, common misconceptions, discussion questions.
   Also adds Present mode (bigger text, no intro paragraph) for the classroom screen.
   Content lives in GUIDES below, keyed by the page's file name. */
(function () {
  'use strict';
  var GUIDES = {
    'chemical-change-lab.html': {
      big: 'In a chemical change the atoms rearrange into new substances, but no atoms are created or destroyed, so mass is conserved.',
      tryThis: [
        'Spot the signs: run three experiments and decide physical or chemical before pressing Check.',
        'Find one experiment that shows a colour change and one that makes a gas.',
        'Mass is conserved: weigh vinegar + baking soda in an open flask, then in a closed flask. Explain the difference.',
        'Atoms rearrange: step through Bonds break → Atoms rearrange → Bonds form and count each atom before and after.',
        'Balance two equations without using the hint.'
      ],
      words: [['Chemical change', 'a new substance forms'], ['Physical change', 'the same substance, a different form or shape'], ['Reactant', 'a substance you start with'], ['Product', 'a substance that forms']],
      goals: ['Name the signs of a chemical change (colour, gas, precipitate, energy change).', 'Explain why mass seems to change in an open flask but not in a closed one.', 'Show with particle diagrams that atoms are only rearranged.', 'Balance simple equations by counting atoms.'],
      flow: [['3 min', 'Predict', 'Show the 9 experiments; students vote physical or chemical for each.'], ['5 min', 'Explore', 'Tab 1 in pairs; record the evidence for each decision.'], ['4 min', 'Explain', 'Tab 2: open vs closed flask. Where did the “missing” mass go?'], ['3 min', 'Apply', 'Tab 4: balance one equation together, one alone.']],
      mis: [['Dissolving or melting is a chemical change.', 'No new substance forms; the Spot-the-signs feedback says why.'], ['Gas has no mass, so mass is lost.', 'The closed flask keeps the gas and the balance does not change.'], ['Balancing means changing the small numbers.', 'Only coefficients change; formulas stay the same.']],
      qs: ['Is boiling water a chemical change? What evidence would you need?', 'Why does the open flask get lighter?', 'In a balanced equation, what stays the same on both sides?']
    },
    'chemical-equilibrium-lab.html': {
      big: 'At equilibrium the forward and reverse reactions still happen, at the same rate. A disturbance makes one side faster until the rates are equal again.',
      tryThis: [
        'Press Start again and wait. Switch the graph to Forward and reverse rates: when do the two lines meet?',
        'With “Predict before each change” on, add NO₂. Predict, then check the graph.',
        'Squeeze to ½ volume. Which side has fewer gas particles?',
        'Heat by 50 K, then cool by 50 K. Watch the colour and the value of Kc.',
        'Add a catalyst. Did the amounts change? Did anything get faster?',
        'Tab 2: make Q < K, then Q > K, and press “Let it reach equilibrium” each time.'
      ],
      words: [['Dynamic equilibrium', 'both reactions continue at equal rates'], ['Kc', 'the ratio of product to reactant concentrations at equilibrium'], ['Q', 'the same ratio at any moment'], ['Le Châtelier', 'a system shifts to reduce a disturbance']],
      goals: ['Describe equilibrium as dynamic, with equal forward and reverse rates.', 'Predict shifts for changes in concentration, pressure (volume) and temperature.', 'Explain why only temperature changes the value of K, and why a catalyst changes neither K nor the position.', 'Compare Q with K to predict the direction of a reaction and use an ICE table.'],
      flow: [['3 min', 'Predict', 'Show the brown flask. Ask: when the colour stops changing, has the reaction stopped?'], ['5 min', 'Explore', 'Tab 1 in pairs with prediction on: each pair tries 4 different disturbances.'], ['4 min', 'Explain', 'Rates graph on the board: forward and reverse lines meet. Link to Q and K.'], ['3 min', 'Apply', 'Tab 2: one H₂/I₂ ICE table together, then the Challenge tab.']],
      mis: [['At equilibrium the reaction stops.', 'Green and rose flashes keep happening; both rate lines stay above zero.'], ['At equilibrium the amounts are equal.', 'The concentration graph settles at different values.'], ['A catalyst shifts equilibrium to the products.', 'Adding the catalyst leaves the amounts unchanged; it only speeds up both reactions.']],
      qs: ['Why does adding NO₂ end with more NO₂ than before, but less than you added?', 'Why does K change with temperature but not with pressure?', 'What would happen if you could remove N₂O₄ as it formed?']
    },
    'enthalpy-lab.html': {
      big: 'Heat is energy transferred because of a temperature difference. q = m c ΔT, and ΔH tells you how much energy a reaction releases or absorbs.',
      tryThis: [
        'Lesson 1: heat two samples with the same burners. Which warms faster: the one with the higher or the lower specific heat?',
        'Lesson 2: drop a hot metal into the calorimeter and predict the final temperature before you look.',
        'Lesson 3: change the mass in a thermochemical equation and see how q changes.',
        'Lesson 4: build a target equation with Hess’s law and check the enthalpy diagram.',
        'Use enthalpies of formation to calculate ΔH°rxn for ethanol burning.'
      ],
      words: [['Specific heat c', 'energy to warm 1 g by 1 °C'], ['Calorimeter', 'an insulated cup that traps heat'], ['ΔH', 'enthalpy change of a reaction'], ['Exothermic', 'releases heat, ΔH < 0']],
      goals: ['Use q = m c ΔT and explain the meaning of specific heat.', 'Analyse calorimetry data: heat lost by the metal = heat gained by the water.', 'Use thermochemical equations, Hess’s law and enthalpies of formation to find ΔH.'],
      flow: [['3 min', 'Predict', 'Sand and water in the sun: which heats faster? Why?'], ['5 min', 'Explore', 'Lessons 1–2 in pairs, recording ΔT.'], ['4 min', 'Explain', 'Work one calorimetry problem with the step-by-step panel.'], ['3 min', 'Apply', 'Hess’s law target equation together.']],
      mis: [['Heat and temperature are the same thing.', 'Same heat input gives different ΔT for different c.'], ['ΔH depends on how fast the reaction happens.', 'Hess’s law: the path does not matter.'], ['The final temperature is the average of the two starting temperatures.', 'Only true when m·c is equal for both.']],
      qs: ['Why is water used to cool car engines?', 'If two steps add to the target, why do their ΔH values add too?', 'What sign does ΔH have when an ice pack gets cold?']
    },
    'entropy-lab.html': {
      big: 'Entropy measures how many ways particles and energy can be arranged. Spreading out (melting, boiling, dissolving, more gas moles) usually means ΔS > 0.',
      tryThis: [
        'Spreading out: remove the wall. Does the gas ever all go back to the left on its own?',
        'Try 4 particles, then 40. How does the chance of “all on the left” change?',
        'Changes & ΔG: predict the sign of ΔS for at least four changes. Find one where ΔS < 0.',
        'Move the temperature: when does a change with ΔH > 0 and ΔS > 0 become spontaneous?',
        'Spontaneous?: get a streak of 5 using ΔG = ΔH − TΔS.'
      ],
      words: [['Microstate', 'one exact arrangement of the particles'], ['Ω', 'number of microstates for what we observe'], ['Entropy S', 'S = k ln Ω: grows with the number of arrangements'], ['ΔS', 'change in entropy'], ['Spontaneous', 'happens without continuous outside help'], ['ΔG = ΔH − TΔS', 'decides spontaneity']],
      goals: ['Predict the sign of ΔS from changes of state, dissolving and moles of gas.', 'Use ΔG = ΔH − TΔS to decide when a change is spontaneous.'],
      flow: [['3 min', 'Predict', 'A messy room vs a tidy room: which has more arrangements?'], ['6 min', 'Explore', 'Students try every change and record the sign of ΔS.'], ['3 min', 'Explain', 'Sort the changes into ΔS > 0 and ΔS < 0 on the board.'], ['3 min', 'Apply', 'Temperature slider: find the temperature where ice melts.']],
      mis: [['Entropy is “disorder” you can see.', 'Count arrangements of particles and energy, not messiness.'], ['Spontaneous means fast.', 'Spontaneity says nothing about the rate.']],
      qs: ['Why is it almost impossible for all the air in the room to gather in one corner?', 'Why does dissolving salt usually increase entropy?', 'Why does water freeze below 0 °C even though ΔS < 0?']
    },
    'equilibrium-table-lab.html': {
      big: 'One table solves every equilibrium problem: initial state, during (with x), final state. x_max comes from the limiting reactant, x_f from the data, then τ = x_f ÷ x_max tells you if the reaction is total (τ = 1) or limited (τ < 1, equilibrium), and K uses the final concentrations.',
      tryThis: [
        'Step by step: open H₂ + I₂ ⇌ 2HI and press Next step until the table is full.',
        'Drag x past x_f. Why does the reaction never get there?',
        'Compare the two esterification problems: how does an excess of acid change τ (the yield)?',
        'Open SO₂ + O₂: which reactant is limiting, and why is it not the one with the smaller amount?',
        'Calculator: type a problem from your book and compare with your own answer.',
        'You calculate: get three perfect tables in a row.'
      ],
      words: [['Progress x', 'how far the reaction has gone (mol)'], ['x_max', 'progress if the reaction were total'], ['Limiting reactant', 'the one that gives the smallest x_max'], ['x_f', 'the real final progress'], ['τ = x_f ÷ x_max', 'final degree of progress'], ['K', 'products over reactants at equilibrium']],
      goals: ['Build the table of progress (initial, during, final) for a balanced equation.', 'Find x_max and the limiting reactant.', 'Use data at the final state (amount, concentration, pH, τ or K) to find x_f.', 'Calculate τ and decide whether a reaction is total or limited.', 'Write K and calculate it from the final concentrations.'],
      flow: [['3 min', 'Predict', 'Does every reaction use up its limiting reactant? Vote before the lab.'], ['6 min', 'Explore', 'Step by step with two problems; students copy each row into their notebooks.'], ['3 min', 'Explain', 'Compare τ for the precipitation (τ = 1) and the esterification (τ ≈ 0.67).'], ['5 min', 'Apply', 'You calculate: pairs solve two random tables.']],
      mis: [['The reactant with the smaller amount is always limiting.', 'Divide each amount by its coefficient first (SO₂ in 2SO₂ + O₂).'], ['At equilibrium the amounts of reactants and products are equal.', 'They are constant, not equal: compare the final row.'], ['x_f is always x_max.', 'Only for a total reaction; at equilibrium x_f < x_max.'], ['Water always appears in K.', 'Leave out the solvent and solids; water made in esterification stays in.']],
      qs: ['Why can a limited reaction never reach x_max?', 'What does τ = 0.67 mean for the yield of an ester?', 'How could you increase τ for an esterification?']
    },
    'esterification-lab.html': {
      big: 'Acid + alcohol ⇌ ester + water is slow, limited and athermic. The class of the alcohol sets the yield; excess reagent or removing water raises it.',
      tryThis: [
        'Tab 1: build ethyl ethanoate. Which atoms make the water? (Look at the boxes.)',
        'Name three esters before revealing the name.',
        'Tab 2: run 1 mol + 1 mol with a primary alcohol at room temperature. Note the time and yield.',
        'Repeat with heat and H₂SO₄. What changed and what stayed the same?',
        'Repeat with 2 mol of acid, then with water removed. Compare the yields.',
        'Tab 3: solve Mr Khaled’s example without opening the solutions.'
      ],
      words: [['Ester', 'R–COO–R′, alkyl alkanoate'], ['Yield', 'n obtained ÷ n theoretical × 100'], ['ATSR', 'according to the stoichiometric ratio'], ['Limited', 'stops at equilibrium, not at completion']],
      goals: ['Write and name the ester from a given acid and alcohol.', 'Build the mole table (t₀, Δn, t_eq) and calculate the yield.', 'Explain the yields 67 %, 60 % and ≈5 % by alcohol class.', 'Separate kinetic factors (heat, catalyst) from factors that change the yield (excess, removing a product).'],
      flow: [['3 min', 'Predict', 'Show the banana smell ester. What two molecules made it?'], ['4 min', 'Explore', 'Tab 1 naming quiz in pairs.'], ['5 min', 'Explain', 'Tab 2: four runs on the board, fill the runs table together.'], ['3 min', 'Apply', 'Tab 3 exercise, steps 1–5.']],
      mis: [['Heating or a catalyst increases the yield.', 'The runs table shows the same yield, only a shorter time.'], ['The name starts with the acid.', 'Alkyl (alcohol) first, then alkanoate (acid).'], ['Theoretical yield uses the reagent in excess.', 'ATSR with the limiting reagent.']],
      qs: ['Why does removing water push the reaction to completion?', 'Why do tertiary alcohols give almost no ester?', 'How is saponification different from hydrolysis?']
    },
    'five-types-of-chemical-reactions.html': {
      big: 'Most reactions fit five patterns: synthesis, decomposition, combustion, single replacement and double replacement.',
      tryThis: [
        'Choose Synthesis. Place the atoms of the reactants, then press Verify Atoms & React.',
        'Do the same for Decomposition. How is it the reverse of synthesis?',
        'Combustion: what two products always form when a hydrocarbon burns completely?',
        'Single replacement: which element swaps places?',
        'Predict the type from the equation before you build it.'
      ],
      words: [['Synthesis', 'A + B → AB'], ['Decomposition', 'AB → A + B'], ['Single replacement', 'A + BC → AC + B'], ['Double replacement', 'AB + CD → AD + CB']],
      goals: ['Classify a reaction from its general pattern.', 'Predict the products of the five reaction types.', 'Count atoms to check conservation.'],
      flow: [['2 min', 'Predict', 'Show five equations; students guess the type of each.'], ['7 min', 'Explore', 'Build every reaction in pairs.'], ['3 min', 'Explain', 'Write the five general patterns on the board.'], ['3 min', 'Apply', 'Classify five new equations.']],
      mis: [['Every reaction with oxygen is combustion.', 'Combustion of a fuel gives CO₂ and H₂O.'], ['Single and double replacement are the same.', 'Count how many swaps happen.']],
      qs: ['Why do metals only replace less reactive metals?', 'Is rusting synthesis or combustion?']
    },
    'galvanic-cell-lab.html': {
      big: 'In a galvanic cell the metal with the bigger tendency to lose electrons is oxidised at the anode; electrons flow through the wire to the cathode, and ions in the salt bridge keep the solutions neutral.',
      tryThis: [
        'Predict the anode for Zn and Cu, then tap the switch on the picture.',
        'Follow one yellow electron from the anode to the cathode. Which way does the current I go?',
        'Drag the salt bridge up out of the beakers. What happens to the current? Why?',
        'Watch the masses: which electrode gets lighter, which gets heavier?',
        'Swap Cu for Ag. Write the overall equation (why 2Ag⁺?).',
        'Tab 2: watch one atom leave the anode in 3D. Switch to Ball-and-stick.'
      ],
      words: [['Anode (−)', 'oxidation, loses electrons'], ['Cathode (+)', 'reduction, gains electrons'], ['Salt bridge', 'keeps neutrality and closes the circuit'], ['E°cell', 'E°cathode − E°anode']],
      goals: ['Identify the anode and cathode using the tendency to lose electrons (E°).', 'Describe electron flow, current direction and ion flow in the salt bridge.', 'Write half-equations, the overall equation and the symbolic representation.', 'Explain mass changes of the electrodes and colour changes of the solutions.'],
      flow: [['2 min', 'Predict', 'Zinc strip in blue CuSO₄: what will happen to the zinc and the colour?'], ['6 min', 'Explore', 'Tab 1 in pairs: predict, close the switch, remove the bridge, try a second pair of metals.'], ['4 min', 'Explain', 'Draw the cell on the board using the stage: e⁻, I, anions and cations in the bridge.'], ['3 min', 'Apply', 'Tab 3 axis: two new metals; Tab 4 protocol order.']],
      mis: [['Electrons travel through the salt bridge.', 'Only ions move in the bridge; electrons stay in the wire.'], ['The anode is positive.', 'In a galvanic cell the anode is the negative electrode.'], ['The bigger electrode is the cathode.', 'It is decided by E°, not size.']],
      qs: ['Why does the cell stop when the salt bridge is removed?', 'Why does the blue colour fade?', 'Which metal pair would give the largest voltage?']
    },
    'keplers-laws.html': {
      big: 'Planets move on ellipses with the Sun at one focus, sweep equal areas in equal times, and T² is proportional to a³.',
      tryThis: [
        'Warm-up: mark where Mars appears each week. Why does it seem to go backward?',
        'First law: change the eccentricity. Where is the Sun?',
        'Second law: compare the swept areas. Where is the planet fastest?',
        'Third law: find which column makes T² ÷ a³ the same for every planet.',
        'Jupiter’s moons: predict a moon’s period from its distance.'
      ],
      words: [['Ellipse', 'an oval with two foci'], ['Eccentricity', 'how stretched the ellipse is'], ['Periapsis / apoapsis', 'closest / furthest point'], ['Period T', 'time for one orbit']],
      goals: ['Describe an elliptical orbit and the position of the Sun.', 'Explain why a planet moves faster near periapsis.', 'Use T² ∝ a³ to compare orbits.'],
      flow: [['3 min', 'Predict', 'Retrograde Mars puzzle.'], ['5 min', 'Explore', 'First and second law tabs.'], ['4 min', 'Explain', 'Equal areas → speed changes.'], ['3 min', 'Apply', 'Third law with Jupiter’s moons.']],
      mis: [['Orbits are circles.', 'Eccentricity slider shows real ellipses.'], ['Seasons come from distance to the Sun.', 'Earth’s orbit is almost circular.']],
      qs: ['Why does a comet speed up near the Sun?', 'A planet twice as far: how much longer is its year?']
    },
    'kinetics-lab.html': {
      big: 'We follow a reaction in time by measuring n(I₂). The rate (slope of the tangent) decreases because the reagents are used up; temperature, concentration and a catalyst make it faster.',
      tryThis: [
        'Before mixing, decide which reagent is limiting using n/coefficient.',
        'Mix and start. Watch the beaker colour and the table fill in.',
        'Tick Show t½: is t½ half of the total time?',
        'Draw a tangent at 2 min and at 12 min. Which slope is bigger? Why?',
        'Keep the curve, then repeat at 40 °C. Compare the two curves.',
        'Tab 2: do Mr Khaled’s example, then press New numbers.'
      ],
      words: [['Limiting reagent', 'smallest n ÷ coefficient'], ['t½', 'time to form half of the maximum product'], ['Instantaneous rate', 'slope of the tangent'], ['Kinetic factors', 'temperature, concentration, catalyst']],
      goals: ['Find the limiting reagent and the maximum amount of product (ATSR).', 'Read t½ from a curve and decide whether a reaction is finished.', 'Find rates from tangents and relate them using the coefficients.', 'Explain the effect of kinetic factors.'],
      flow: [['2 min', 'Predict', 'Which reagent runs out first? Vote.'], ['5 min', 'Explore', 'Tab 1: run, show t½, draw two tangents.'], ['4 min', 'Explain', 'Compare a 20 °C and a 40 °C curve with Keep this curve.'], ['4 min', 'Apply', 'Tab 2 exercise, steps 1–4.']],
      mis: [['t½ is half of the time the experiment lasted.', 'It is defined by half of n(I₂)max.'], ['The rate stays constant.', 'Tangent slopes fall over time.'], ['The reaction ends when the table ends.', 'Compare with n(I₂)max (step 2).']],
      qs: ['Why does the curve flatten?', 'How would doubling V(H₂O₂) change n(I₂)max?', 'Why is the sample put in ice water?']
    },
    'organic-naming-lab.html': {
      big: 'An IUPAC name is built from the longest chain (or ring), the main functional group, and the positions of the branches, numbered to keep numbers low.',
      tryThis: [
        'Build hexane, then move one carbon to make a branch. How does the name change?',
        'Hide the name and guess first; then compare with the steps.',
        'Name challenge: get five in a row.',
        'Isomer hunt: find all isomers of C₅H₁₂.',
        'Mystery compounds: identify one bottle with as few tests as possible.',
        '3D model: build butane and turn it. Why is the chain a zig-zag and not a straight line?',
        'Load benzene. With resonance off, compare the 1.34 Å and 1.54 Å bonds, then press Flip.',
        'Turn resonance on. What happens to the bond lengths and to the π electrons?'
      ],
      words: [['Resonance hybrid', 'the real structure: an average of the Kekulé structures'], ['Delocalised', 'π electrons spread over the whole ring'], ['Parent chain', 'the longest carbon chain'], ['Substituent', 'a branch or group on the chain'], ['Functional group', 'the reactive part, e.g. –OH, –COOH'], ['Isomers', 'same formula, different structure']],
      goals: ['Name and draw alkanes, alkenes, alkynes, rings and compounds with functional groups.', 'Recognise structural and functional isomers.', 'Use lab tests to identify a family.'],
      flow: [['2 min', 'Predict', 'Show two structures with the same formula. Same compound?'], ['6 min', 'Explore', 'Build & name in pairs.'], ['4 min', 'Explain', 'Isomer hunt on the board.'], ['3 min', 'Apply', 'Mystery compounds.']],
      mis: [['The longest chain is the one drawn straight.', 'The builder counts bends too.'], ['Numbering always starts from the left.', 'Lowest locants decide the direction.']],
      qs: ['Why do butane and 2-methylpropane boil at different temperatures?', 'Which test separates an aldehyde from a ketone?']
    },
    'pulse-at-a-boundary.html': {
      big: 'When a pulse reaches a boundary, part reflects and part is transmitted. A heavier (slower) medium flips the reflected pulse; a lighter one does not.',
      tryThis: [
        'Spring 2: choose Lighter. Is the reflected pulse upright or inverted?',
        'Now choose Heavier. What changed?',
        'Wall: how much passes through?',
        'Same: why is there no reflection?',
        'Drag the knob on the pulse down to send an upside-down pulse. Does the rule still hold?'
      ],
      words: [['Incident', 'the pulse that arrives'], ['Reflected', 'the pulse that comes back'], ['Transmitted', 'the pulse that passes into the second medium'], ['Inverted', 'flipped upside down']],
      goals: ['Predict whether the reflected pulse is inverted.', 'Compare speeds and widths of transmitted pulses.', 'Explain energy sharing at a boundary.'],
      flow: [['2 min', 'Predict', 'Pulse into a heavier rope: upright or flipped?'], ['6 min', 'Explore', 'All four set-ups.'], ['4 min', 'Explain', 'Fill a table: reflected/transmitted, upright/inverted.'], ['3 min', 'Apply', 'Light → water: where does light reflect?']],
      mis: [['All of the pulse reflects.', 'Most boundaries share the energy.'], ['The transmitted pulse is inverted.', 'Only the reflected pulse can invert.']],
      qs: ['Why is the transmitted pulse narrower in a slower medium?', 'What would a perfectly matched boundary look like?']
    },
    'reaction-rates-lab.html': {
      big: 'Particles must collide with enough energy (≥ Ea) and the right orientation. Temperature, concentration, surface area and catalysts change how many collisions succeed each second.',
      tryThis: [
        'Run at 300 K and keep the run. Repeat at 500 K. Compare the curves.',
        'Watch the share that react: does it change with concentration? With temperature?',
        'Solid A: compare one lump with powder.',
        'Energy view: move Temperature 2 up by 10 K. How much bigger is the shaded area?',
        'Add a catalyst in the energy diagram. What happens to ΔH?',
        'Find the rate law for 2NO + O₂ from three trials.'
      ],
      words: [['Activation energy Ea', 'minimum energy for a successful collision'], ['Rate', '−Δ[A] ÷ Δt'], ['Catalyst', 'lowers Ea, not used up'], ['Rate law', 'rate = k[A]^m[B]^n']],
      goals: ['Explain rate using collision theory.', 'Explain why a small temperature rise has a big effect (energy distribution).', 'Describe the effect of surface area and catalysts.', 'Find orders and k by the method of initial rates.'],
      flow: [['2 min', 'Predict', 'Why do we keep milk in the fridge?'], ['6 min', 'Explore', 'Collision box: four kept runs.'], ['4 min', 'Explain', 'Energy view: shaded area beyond Ea.'], ['3 min', 'Apply', 'Rate law tab, one reaction.']],
      mis: [['Higher temperature only makes more collisions.', 'The share that react rises far more.'], ['A catalyst gives particles more energy.', 'It lowers Ea; the curve does not change.']],
      qs: ['Why does powdered sugar burn faster than a sugar cube?', 'Why does the rate fall as the reaction goes on?']
    },
    'resonance-on-a-string.html': {
      big: 'A string resonates when the driving frequency matches one of its natural frequencies, fₙ = n v ÷ 2L, giving standing waves with nodes and antinodes.',
      tryThis: [
        'Sweep 1 → 60 Hz and watch the resonance curve. How many peaks?',
        'Stop at the first peak. Count nodes and antinodes.',
        'Change the length L. Do the peaks move left or right?',
        'Choose a heavier string. What happens to v and the resonant frequencies?',
        'Show the predicted curve: does it match your peaks?'
      ],
      words: [['Resonance', 'large amplitude at a natural frequency'], ['Node', 'a point that does not move'], ['Antinode', 'a point of maximum swing'], ['Harmonic', 'fₙ = n f₁']],
      goals: ['Identify resonant frequencies and harmonics.', 'Relate nodes and antinodes to wavelength.', 'Use fₙ = n v ÷ 2L.'],
      flow: [['2 min', 'Predict', 'Pushing a swing: when do small pushes make big swings?'], ['6 min', 'Explore', 'Sweep and find the peaks.'], ['4 min', 'Explain', 'Draw harmonics 1–3 and count λ/2.'], ['3 min', 'Apply', 'Guitar string: shorten L, what happens to the pitch?']],
      mis: [['Any frequency makes a standing wave.', 'Only the peaks of the curve do.'], ['Nodes are where the string is fixed only.', 'Higher harmonics have nodes in the middle too.']],
      qs: ['Why does pressing a guitar string raise the pitch?', 'Why can soldiers break a bridge by marching in step?']
    },
    'titration-lab.html': {
      big: 'During a dilution the moles of solute stay the same (C₀V₀ = CV). In a titration the reagents react in their stoichiometric ratio at the equivalence point, so a measured volume gives an unknown concentration.',
      tryThis: [
        'Dilution: choose an Erlenmeyer flask on purpose and press Check. Why is it refused?',
        'Find a pipette and flask that give the dilution factor, then do the protocol without a wrong step.',
        'Fill to the line drop by drop in the magnifier without going over.',
        'Prepare a solution from a solid: calculate m = C × V × M, weigh it, follow the steps.',
        'Titration: do a fast rough trial, then two accurate trials that agree within 0.10 mL.',
        'Try methyl orange with CH₃COOH. Why does it change colour too early?',
        'Redox: titrate Fe²⁺ with KMnO₄. What tells you the end point without an indicator?',
        'Real lab: after a real titration, type your burette readings. Is the true value inside your margin of error? If not, which mistake explains it?'
      ],
      words: [['Dilution factor f', 'C₀ / C = V / V₀'], ['Volumetric flask', 'holds exactly V at the line'], ['Equivalence point', 'reagents in stoichiometric ratio'], ['End point', 'where the indicator changes colour'], ['Concordant', 'trials within 0.10 mL'], ['Margin of error', 'the ± range your glassware allows: random error'], ['Systematic error', 'a mistake that pushes every result the same way']],
      goals: ['Choose suitable glassware for a dilution and justify the choice with f = V / V₀.', 'Describe the protocols for dilution, preparation from a solid, and titration in the right order.', 'Read a burette at the bottom of the meniscus and record concordant results.', 'Use ATSR at the equivalence point to find an unknown concentration (acid–base and redox).', 'Choose an indicator from the pH curve.'],
      flow: [['3 min', 'Predict', 'Show three glassware sets from the Challenge tab; students vote which one dilutes correctly.'], ['5 min', 'Explore', 'Tab 1 in pairs: dilution with the protocol.'], ['5 min', 'Explain', 'Tab 3 on the board: a rough trial, then an accurate one; point at the pH curve and the indicator range.'], ['2 min', 'Apply', 'Students calculate the unknown and press Check.']],
      mis: [['Any flask with a 250 mL mark is fine for a dilution.', 'The lab refuses Erlenmeyer flasks and beakers and explains why.'], ['The end point is always at pH 7.', 'The weak-acid curve shows equivalence near pH 8.7.'], ['Rinsing the pipette with water is cleaner.', 'Step feedback: rinse with the stock so it is not diluted.'], ['More indicator makes the result more accurate.', 'Indicator range vs. equivalence pH is what matters.']],
      qs: ['Why does the pink colour disappear when you swirl, until the very end?', 'Why must the flask be filled drop by drop at the end?', 'How would forgetting to rinse the burette with NaOH change your result?']
    },
    'torque-lab.html': {
      big: 'Torque is the turning effect of a force: τ = F r sin θ. Push far from the pivot and at 90° for the biggest torque. Balanced torques give rotational equilibrium.',
      tryThis: [
        'Push the door near the hinge, then at the knob with the same force. Compare τ.',
        'Change the angle to 45°, then to 0°. What happens to the lever arm?',
        'Seesaw: a heavy child and a light child. Where must each sit to balance?',
        'Lever lab: put bricks on the plank, predict which side goes down, then remove the supports.',
        'Lever lab: find the mass of mystery brick A by balancing it with known bricks.',
        'Challenge: solve one question before showing the solution.'
      ],
      words: [['Torque τ', 'turning effect, N·m'], ['Lever arm', 'perpendicular distance from pivot to the force line'], ['Pivot', 'the axis of rotation'], ['Equilibrium', 'clockwise τ = counter-clockwise τ']],
      goals: ['Calculate τ = F r sin θ.', 'Explain the lever arm.', 'Apply balanced torques to a seesaw.'],
      flow: [['2 min', 'Predict', 'Why are door handles far from the hinges?'], ['5 min', 'Explore', 'Door tab presets.'], ['5 min', 'Explain', 'Seesaw: m₁r₁ = m₂r₂.'], ['3 min', 'Apply', 'Challenge tab.']],
      mis: [['A bigger force always gives a bigger torque.', 'Not if r is tiny or θ = 0.'], ['Torque and force are the same.', 'Torque also depends on where and how you push.']],
      qs: ['Why are spanners long?', 'Where would you push to open a door with the least force?']
    },
    'wave-speed-lab.html': {
      big: 'The speed of a wave depends on the medium (tension and mass of the string), not on how fast or how hard you shake it: v = f λ.',
      tryThis: [
        'Oscillate at 1 Hz. Measure λ with the ruler and calculate v = f λ.',
        'Double the frequency. What happens to λ? To v?',
        'Pulse race: a bigger pulse vs a smaller pulse on the same string. Which arrives first?',
        'Make string A tighter. Now which arrives first?',
        'Sound tab: does a higher note travel faster?'
      ],
      words: [['Wavelength λ', 'length of one full wave'], ['Frequency f', 'waves per second, Hz'], ['Wave speed v', 'v = f λ'], ['Tension', 'how tightly the string is pulled']],
      goals: ['Measure λ and T and calculate v = f λ.', 'Show that v depends on the medium, not on f or amplitude.', 'Explain why λ changes when f changes.'],
      flow: [['2 min', 'Predict', 'Does shaking faster make the wave travel faster? Vote.'], ['6 min', 'Explore', 'String lab measurements.'], ['4 min', 'Explain', 'Pulse race results table.'], ['3 min', 'Apply', 'Sound tab and Challenge.']],
      mis: [['Higher frequency means faster wave.', 'Same string, same speed; λ gets shorter.'], ['Bigger pulses travel faster.', 'The race shows a tie.']],
      qs: ['Why do all notes from a band reach you at the same time?', 'How could you make a wave travel faster on a rope?']
    }
  };

  var file = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
  var G = GUIDES[file];
  if (!G) return;
  /* answers to the discussion questions, in the same order (for the answer key and "Reveal answers") */
  var ANSWERS = {
    'chemical-change-lab.html': ['No. Steam is still water (H₂O), and cooling turns it back. You would need evidence of a NEW substance: a gas with new properties, a colour change, a precipitate, or heat or light given out.', 'The carbon dioxide gas made in the reaction escapes into the air and takes its mass with it. In the closed flask the gas stays in, so the mass does not change.', 'The number of atoms of each element, so the total mass. Only the way the atoms are joined changes.'],
    'chemical-equilibrium-lab.html': ['The system shifts towards N₂O₄ to use up some of the added NO₂, but only partly. K stays the same, so [NO₂] settles higher than before, but lower than just after you added it.', 'ΔH is not zero, so temperature changes the forward and reverse rates by different amounts and their ratio K changes. Pressure and concentration only move the amounts; at the new equilibrium the ratio is the same K.', 'The equilibrium keeps shifting forwards: more NO₂ turns into N₂O₄ until almost all of it is used up. The reaction goes almost to completion.'],
    'enthalpy-lab.html': ['Water has a very high specific heat (4.18 J/g·°C): it takes in a lot of heat for a small rise in temperature.', 'Enthalpy depends only on the start and the end, not on the path (Hess’s law). Adding the equations adds their ΔH.', 'Positive (ΔH > 0): the change is endothermic and takes heat from your hand.'],
    'entropy-lab.html': ['There are only a few ways to put every molecule in one corner, and astronomically more ways to spread them out. The chance is about (½)^N, with N ≈ 10²⁷.', 'The ions spread out through the water, so there are far more ways to arrange them than in the ordered crystal.', 'Freezing gives out heat (ΔH < 0). Below 0 °C the term −TΔS is smaller than |ΔH|, so ΔG = ΔH − TΔS < 0.'],
    'equilibrium-table-lab.html': ['As products form, the reverse reaction speeds up until it is as fast as the forward one. This happens at x_f < x_max, and then the amounts stop changing.', 'Only 67 % of the greatest possible amount of ester forms: the yield is 67 %.', 'Use an excess of the acid or the alcohol, or remove the water (or the ester) as it forms.'],
    'esterification-lab.html': ['Removing a product makes Q smaller than K, so the forward reaction carries on until the limiting reagent is used up.', 'The bulky groups around the C–OH get in the way (steric hindrance), so the equilibrium lies almost completely on the side of the reactants: a yield of about 5 %.', 'Hydrolysis (ester + water) is slow and limited: it stops at equilibrium. Saponification (ester + hydroxide, e.g. NaOH) is complete and gives an alcohol and a carboxylate ion (soap).'],
    'five-types-of-chemical-reactions.html': ['A more reactive metal gives up electrons more easily, so it can push the ions of a less reactive metal out of a compound, but not the other way round (the activity series).', 'Synthesis: iron + oxygen → iron oxide, slowly and without a flame. Combustion is the fast burning of a fuel.'],
    'galvanic-cell-lab.html': ['Without the bridge, ions cannot move to keep each beaker neutral. Charge builds up, the circuit is open, and the electrons stop flowing.', 'The blue Cu²⁺ ions are reduced to copper metal on the cathode, so there are fewer of them in the solution.', 'The two metals furthest apart on the E° scale, because E°cell = E°cathode − E°anode. For example Zn and Ag: 0.80 − (−0.76) = 1.56 V.'],
    'keplers-laws.html': ['Equal areas in equal times: near the Sun the line to the Sun is short, so the comet must move faster to sweep the same area.', 'T² ∝ a³, so T ∝ a^1.5: 2^1.5 ≈ 2.8 times longer.'],
    'kinetics-lab.html': ['The reagents are used up, so collisions become rarer and the rate (the slope) falls to zero when the limiting reagent is gone.', 'If H₂O₂ is the limiting reagent, n(I₂)max doubles. If iodide is limiting, it stays the same.', 'Cold water slows the reaction almost to a stop, so the amount you measure is the amount at that moment.'],
    'organic-naming-lab.html': ['Same formula, C₄H₁₀, but a different shape. The straight chain has more surface contact and stronger London forces, so butane boils higher (about −1 °C, against about −12 °C).', 'Tollens’ reagent (silver mirror) or Fehling’s solution (red precipitate): positive with an aldehyde, negative with a ketone.'],
    'pulse-at-a-boundary.html': ['The pulse lasts the same time, but in a slower medium it travels a shorter distance in that time: width = speed × duration.', 'The same mass per metre on both sides (the same speed): nothing reflects, and the whole pulse passes through unchanged (R = 0, T = 1).'],
    'reaction-rates-lab.html': ['Powder has a much bigger surface area: more particles meet oxygen, so there are more collisions each second.', 'The reactants are used up, so their concentrations fall and there are fewer collisions each second.'],
    'resonance-on-a-string.html': ['Pressing shortens the vibrating length L. Since f₁ = v ÷ 2L, the frequency goes up.', 'If their steps match a natural frequency of the bridge, every step adds energy at the right moment: resonance builds a huge swing.'],
    'titration-lab.html': ['Until the end the acid in the flask is in excess and neutralises the base you add. The pink stays only when no acid is left, just past the equivalence point.', 'So that you do not go past the line: the bottom of the meniscus must sit exactly on the mark for the volume to be right.', 'Water left in the burette dilutes the NaOH, so you need a bigger volume, and the acid concentration you calculate comes out too high.'],
    'torque-lab.html': ['A longer lever arm r gives a bigger torque, τ = F r, for the same force, so you need less force.', 'At the edge furthest from the hinges, pushing at 90° to the door.'],
    'wave-speed-lab.html': ['All sounds travel at the same speed in the same air (about 340 m/s). The frequency changes the wavelength, not the speed.', 'Pull it tighter (more tension) or use a lighter rope (less mass per metre): v = √(T ÷ μ).']
  };
  var A = ANSWERS[file] || [];

  var css = '' +
    '.lg-btn{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;' +
    'font:700 15px/1 var(--body,system-ui,-apple-system,"Segoe UI",sans-serif);padding:12px 16px;border-radius:999px;border:0;cursor:pointer;background:#0A6A88;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.22)}' +
    '.lg-btn:focus-visible,.lg-x:focus-visible,.lg-tab:focus-visible,.lg-pres:focus-visible{outline:3px solid #F59E5B;outline-offset:2px}' +
    '.lg-btn .q{width:20px;height:20px;border-radius:50%;background:#fff;color:#0A6A88;display:inline-flex;align-items:center;justify-content:center;font-size:13px}' +
    '.lg-back{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:70}' +
    '.lg-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:71;background:Canvas;color:CanvasText;box-shadow:-10px 0 30px rgba(0,0,0,.25);display:flex;flex-direction:column;' +
    'font:16px/1.5 var(--body,system-ui,-apple-system,"Segoe UI",sans-serif);padding-top:env(safe-area-inset-top,0px)}' +
    '.lg-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 16px 8px}' +
    '.lg-head b{font-size:18px}' +
    '.lg-x{border:1.5px solid color-mix(in srgb,CanvasText 25%,transparent);background:none;color:inherit;border-radius:9px;padding:6px 12px;font:600 14px var(--body,system-ui);cursor:pointer}' +
    '.lg-tabs{display:flex;gap:4px;padding:0 16px;border-bottom:1.5px solid color-mix(in srgb,CanvasText 18%,transparent)}' +
    '.lg-tab{border:0;background:none;color:inherit;opacity:.65;padding:10px 12px;font:700 15px var(--body,system-ui);border-bottom:3px solid transparent;margin-bottom:-1.5px;cursor:pointer}' +
    '.lg-tab[aria-selected="true"]{opacity:1;border-bottom-color:#0A6A88}' +
    '.lg-body{overflow:auto;padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px}' +
    '.lg-big{margin:0;padding:12px 14px;border-left:4px solid #0A6A88;background:color-mix(in srgb,#0A6A88 10%,transparent);border-radius:0 10px 10px 0;font-weight:600}' +
    '.lg-body h3{margin:4px 0 0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7}' +
    '.lg-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}' +
    '.lg-list label{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:10px;border:1.5px solid color-mix(in srgb,CanvasText 14%,transparent);cursor:pointer}' +
    '.lg-list input{width:18px;height:18px;margin:2px 0 0;flex:none;accent-color:#0A6A88}' +
    '.lg-list input:checked+span{text-decoration:line-through;opacity:.6}' +
    '.lg-words{display:flex;flex-wrap:wrap;gap:6px}' +
    '.lg-words span{border:1.5px solid color-mix(in srgb,CanvasText 18%,transparent);border-radius:9px;padding:5px 9px;font-size:14px}' +
    '.lg-prog{font:600 13px ui-monospace,monospace;opacity:.75}' +
    '.lg-flow{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}' +
    '.lg-flow li{display:grid;grid-template-columns:4.2em 1fr;gap:2px 10px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,CanvasText 5%,transparent)}' +
    '.lg-flow .t{font:600 13px ui-monospace,monospace;opacity:.75;grid-row:span 2}' +
    '.lg-mis{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:8px}' +
    '.lg-mis small{display:block;opacity:.75}' +
    '.lg-ol{margin:0;padding-left:1.3em;display:flex;flex-direction:column;gap:5px}' +
    '.lg-pres{align-self:flex-start;border:1.5px solid #0A6A88;background:none;color:inherit;border-radius:9px;padding:8px 12px;font:700 14px var(--body,system-ui);cursor:pointer}' +
    'html.lg-present{font-size:125%}html.lg-present body{font-size:1.15em}html.lg-present .lede,html.lg-present footer{display:none!important}' +
    '.lg-btn,.lg-panel button{width:auto!important;min-width:0!important;margin:0!important;text-transform:none!important;letter-spacing:normal!important;flex:none}' +
    '.lg-btn{left:auto!important;top:auto!important}' +
    '.lg-panel label{width:auto!important;margin:0!important;text-transform:none!important;letter-spacing:normal!important;font-size:inherit!important;color:inherit!important}' +
    '.lg-qs{margin:0;padding-left:1.3em;display:flex;flex-direction:column;gap:10px}' +
    '.lg-qs .a{display:block;margin-top:5px;padding:7px 10px;border-radius:8px;background:color-mix(in srgb,#3898A8 12%,transparent);border-left:3px solid #3898A8;font-size:14.5px}' +
    '.lg-panel .lg-qs .a[hidden]{display:none!important}' +
    '.lg-row{display:flex;flex-wrap:wrap;gap:8px}' +
    '.lg-act{border:1.5px solid color-mix(in srgb,CanvasText 25%,transparent);background:none;color:inherit;border-radius:9px;padding:8px 12px;font:700 14px var(--body,system-ui);cursor:pointer}' +
    '.lg-act.pri{background:#0A6A88;border-color:#0A6A88;color:#fff}' +
    '.lg-print{display:none}' +
    '@media print{.lg-btn{display:none}' +
    'body>*:not(.lg-print){display:none!important}html,body{background:#fff!important;padding:0!important;margin:0!important;height:auto!important}' +
    '.lg-print{display:block!important;color:#111;font:11.5pt/1.45 "Atkinson Hyperlegible",system-ui,sans-serif}' +
    '.lg-print h1{font:800 20pt/1.1 "Bricolage Grotesque",system-ui,sans-serif;margin:0 0 2pt}' +
    '.lg-print .ey{margin:0;color:#444;font-size:10pt}' +
    '.lg-print .who{display:flex;gap:18pt;margin:10pt 0 12pt;font-size:10.5pt}.lg-print .who span{flex:1;border-bottom:1px solid #999;padding-bottom:2pt}' +
    '.lg-print h2{font:700 12.5pt/1.2 "Atkinson Hyperlegible",system-ui,sans-serif;margin:14pt 0 6pt;border-bottom:1.5px solid #111;padding-bottom:2pt}' +
    '.lg-print ol,.lg-print ul{margin:0;padding-left:16pt}.lg-print li{margin:0 0 8pt;break-inside:avoid}' +
    '.lg-print .ln{display:block;border-bottom:1px solid #bbb;height:19pt}' +
    '.lg-print .ans{display:block;margin-top:3pt;font-style:italic;color:#0A4F66}' +
    '.lg-print .tick{display:inline-block;width:10pt;height:10pt;border:1.2px solid #111;margin-right:6pt;vertical-align:-1pt}' +
    '.lg-print .big{margin:8pt 0 0;padding:6pt 9pt;border-left:3pt solid #0A6A88;background:#EEF5F7}' +
    '.lg-print .words{display:grid;grid-template-columns:1fr 1fr;gap:3pt 16pt;font-size:10.5pt}' +
    '.lg-print .foot{display:flex;align-items:center;gap:10pt;margin-top:14pt;font-size:9.5pt;color:#444}.lg-print .foot svg{width:62pt;height:62pt}' +
    '@page{size:A4;margin:14mm}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var KEY = 'lg:' + file;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  var state = load();
  try { if (localStorage.getItem('lg:present') === '1') document.documentElement.classList.add('lg-present'); } catch (e) {}

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function studentHTML() {
    var done = state.done || {};
    var n = G.tryThis.filter(function (_, i) { return done[i]; }).length;
    return '<p class="lg-big">' + esc(G.big) + '</p>' +
      '<h3>Try this</h3><span class="lg-prog" id="lgProg">' + n + ' of ' + G.tryThis.length + ' done</span>' +
      '<ul class="lg-list">' + G.tryThis.map(function (t, i) { return '<li><label><input type="checkbox" data-i="' + i + '"' + (done[i] ? ' checked' : '') + '><span>' + esc(t) + '</span></label></li>'; }).join('') + '</ul>' +
      '<h3>Words to know</h3><div class="lg-words">' + G.words.map(function (w) { return '<span><b>' + esc(w[0]) + '</b>: ' + esc(w[1]) + '</span>'; }).join('') + '</div>' +
      '<h3>Questions to try</h3><ol class="lg-qs">' + G.qs.slice(0, 3).map(function (q, i) { return '<li>' + esc(q) + (A[i] ? '<span class="a" hidden>' + esc(A[i]) + '</span>' : '') + '</li>'; }).join('') + '</ol>' +
      '<div class="lg-row">' + (A.length ? '<button type="button" class="lg-act" data-reveal>Reveal answers</button>' : '') + '<button type="button" class="lg-act pri" data-print="0">Print worksheet</button></div>';
  }
  function teacherHTML() {
    return '<button type="button" class="lg-pres" id="lgPres"></button>' +
      '<h3>Learning goals: students will be able to</h3><ol class="lg-ol">' + G.goals.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ol>' +
      '<h3>15-minute lesson</h3><ul class="lg-flow">' + G.flow.map(function (f) { return '<li><span class="t">' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b><span>' + esc(f[2]) + '</span></li>'; }).join('') + '</ul>' +
      '<h3>Common misconceptions</h3><ul class="lg-mis">' + G.mis.map(function (m) { return '<li>“' + esc(m[0]) + '”<small>How the lab shows it: ' + esc(m[1]) + '</small></li>'; }).join('') + '</ul>' +
      '<h3>Discussion questions</h3><ol class="lg-qs">' + G.qs.map(function (q, i) { return '<li>' + esc(q) + (A[i] ? '<span class="a">' + esc(A[i]) + '</span>' : '') + '</li>'; }).join('') + '</ol>' +
      '<div class="lg-row"><button type="button" class="lg-act pri" data-print="0">Print worksheet</button>' + (A.length ? '<button type="button" class="lg-act" data-print="1">Print answer key</button>' : '') + '</div>';
  }

  /* a printable worksheet: the checklist, the questions with space to write, the key words and a QR code to the lab */
  function printSheet(key) {
    var title = ((document.querySelector('.topbar h1') || document.querySelector('h1') || {}).textContent || document.title).trim();
    var ey = ((document.querySelector('.eyebrow') || document.querySelector('.tb-tag') || {}).textContent || '').trim();
    var url = location.href.split('#')[0].split('?')[0];
    function build() {
      var qr = window.QR ? QR.svg(url, { ecc: 'M', border: 1, dark: '#111' }) : '';
      var lines = function (n) { var s = ''; for (var i = 0; i < n; i++) s += '<span class="ln"></span>'; return s; };
      var html = '<h1>' + esc(title) + (key ? ' · answer key' : '') + '</h1>' + (ey ? '<p class="ey">' + esc(ey) + '</p>' : '') +
        (key ? '<p class="big"><b>Big idea:</b> ' + esc(G.big) + '</p>' : '<div class="who"><span>Name</span><span>Class</span><span>Date</span></div>') +
        '<h2>1 · Try this in the lab</h2><ul style="list-style:none;padding-left:0">' + G.tryThis.map(function (t) { return '<li><span class="tick"></span>' + esc(t) + (key ? '' : lines(1)) + '</li>'; }).join('') + '</ul>' +
        '<h2>2 · Questions</h2><ol>' + G.qs.map(function (q, i) { return '<li>' + esc(q) + (key ? (A[i] ? '<span class="ans">' + esc(A[i]) + '</span>' : '') : lines(3)) + '</li>'; }).join('') + '</ol>' +
        '<h2>3 · Words to know</h2><div class="words">' + G.words.map(function (w) { return '<div><b>' + esc(w[0]) + '</b>: ' + esc(w[1]) + '</div>'; }).join('') + '</div>' +
        '<div class="foot">' + qr + '<span>Open the lab: ' + esc(url) + '<br>Science Simulations · Mr Khaled</span></div>';
      var el = document.querySelector('.lg-print'); if (!el) { el = document.createElement('div'); el.className = 'lg-print'; document.body.appendChild(el); }
      el.innerHTML = html;
      try { window.print(); } catch (e) { }
    }
    if (window.QR) build();
    else { var sc = document.createElement('script'); sc.src = 'qr.js'; sc.onload = build; sc.onerror = build; document.head.appendChild(sc); }
  }

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'lg-btn'; btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = '<span class="q" aria-hidden="true">?</span>Guide';
  document.body.appendChild(btn);

  var back, panel, side = state.side || 'student', lastFocus;
  function presLabel() { var on = document.documentElement.classList.contains('lg-present'); var b = document.getElementById('lgPres'); if (b) b.textContent = on ? 'Present mode: on (bigger text)' : 'Present mode: off: turn on for the classroom screen'; }
  function render() {
    panel.querySelector('.lg-body').innerHTML = side === 'student' ? studentHTML() : teacherHTML();
    panel.querySelectorAll('.lg-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.side === side)); });
    panel.querySelectorAll('.lg-list input').forEach(function (cb) {
      cb.onchange = function () { state.done = state.done || {}; state.done[cb.dataset.i] = cb.checked; save(state);
        var n = G.tryThis.filter(function (_, i) { return state.done[i]; }).length; document.getElementById('lgProg').textContent = n + ' of ' + G.tryThis.length + ' done' + (n === G.tryThis.length ? ' 🎉' : ''); };
    });
    var rv = panel.querySelector('[data-reveal]');
    if (rv) rv.onclick = function () { var as = panel.querySelectorAll('.lg-qs .a'), show = as.length && as[0].hidden; as.forEach(function (a) { a.hidden = !show; }); rv.textContent = show ? 'Hide answers' : 'Reveal answers'; };
    panel.querySelectorAll('[data-print]').forEach(function (b) { b.onclick = function () { printSheet(b.dataset.print === '1'); }; });
    var pb = document.getElementById('lgPres');
    if (pb) { presLabel(); pb.onclick = function () { var on = document.documentElement.classList.toggle('lg-present'); try { localStorage.setItem('lg:present', on ? '1' : '0'); } catch (e) {} presLabel(); window.dispatchEvent(new Event('resize')); }; }
  }
  function open() {
    lastFocus = document.activeElement;
    back = document.createElement('div'); back.className = 'lg-back'; back.onclick = close;
    panel = document.createElement('div'); panel.className = 'lg-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Lab guide');
    panel.innerHTML = '<div class="lg-head"><b>Lab guide</b><button type="button" class="lg-x">Close</button></div>' +
      '<div class="lg-tabs" role="tablist"><button type="button" role="tab" class="lg-tab" data-side="student">For students</button><button type="button" role="tab" class="lg-tab" data-side="teacher">For teachers</button></div><div class="lg-body"></div>';
    document.body.appendChild(back); document.body.appendChild(panel);
    panel.querySelector('.lg-x').onclick = close;
    panel.querySelectorAll('.lg-tab').forEach(function (t) { t.onclick = function () { side = t.dataset.side; state.side = side; save(state); render(); }; });
    render(); panel.querySelector('.lg-x').focus();
    document.addEventListener('keydown', onKey, true);
  }
  function close() { if (!panel) return; panel.remove(); back.remove(); panel = null; document.removeEventListener('keydown', onKey, true); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  btn.onclick = open;
})();

/* Simple / Full view — one switch for every lab (choice remembered on this device).
   Simple (default): only the controls needed for the main idea, no intro paragraph, short feedback
   that expands when tapped, and a pulsing "start here" on the first action. Full: everything. */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
  if (file === 'index.html' || file === '') return;
  var CFG = {
    'wave-speed-lab.html': { hide: ['[data-mode="manual"]', '.seg:has([data-end])', '#step1', '.seg:has([data-speed])', 'label:has(#tVRuler)', 'label:has(#tRef)', 'label:has(#tGraph)', 'label:has(#tVals)', '[data-n]', '.field:has(#damp1)'] },
    'kinetics-lab.html': { hide: ['.seg:has([data-spd])', '.field:has([data-every])', '.seg:has([data-view])', 'label:has(#cMax)'], start: '#runBtn' },
    'galvanic-cell-lab.html': { hide: ['#p-cell > .checks', '.seg:has([data-rep])', 'label:has(#c3Lab)', '#t3Reset'], start: '#swBtn' },
    'organic-naming-lab.html': { hide: ['.row:has(> #o3dSF)', 'label:has(#o3dH)', '#o3dReset'] },
    'resonance-on-a-string.html': { hide: ['#fDown', '#fUp', '#pdf', '.field:has(#dampSeg)', '.field:has(#slowSeg)', 'label:has(#cEnv)', 'label:has(#cTheory)', 'section.block:has(#hWhy)', 'section.block:has(#hLesson)'], start: '#sweep' },
    'enthalpy-lab.html': { hide: ['.card:has(> .worked)'], start: '#heatGo' },
    'chemical-equilibrium-lab.html': { hide: ['.seg:has([data-spd])', '[data-stress="remD"]'] },
    'reaction-rates-lab.html': { hide: ['.seg:has([data-spd])', 'label:has(#cFlash)'] },
    'pulse-at-a-boundary.html': { hide: ['section.look', '.speed', '.field:has(#ratio)'] },
    'chemical-change-lab.html': { start: '#runBtn' },
    'titration-lab.html': { hide: ['[data-scoop="0.01"]', 'label:has(#cMeter)'], start: '#chkGlass' },
    'esterification-lab.html': { hide: ['label:has(#cHide)'] },
    'torque-lab.html': {},
    'keplers-laws.html': { hide: ['#step'] },
    'entropy-lab.html': { hide: ['#waysCard .seg'], start: '#wallBtn' },
    'equilibrium-table-lab.html': { hide: ['#stAll'], start: '#stNext' },
    'five-types-of-chemical-reactions.html': {}
  };
  var cfg = CFG[file] || {};
  var hide = (cfg.hide || []).concat(['.lede', 'header p.lede', '.head-text p:not(.eyebrow)', 'p.foot', 'p.fine']);
  var css = 'html.lg-simple ' + hide.join(',html.lg-simple ') + '{display:none!important}' +
    'html.lg-simple p.note,html.lg-simple p.caption{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;cursor:pointer;position:relative}' +
    'html.lg-simple p.note.lg-open,html.lg-simple p.caption.lg-open{display:block}' +
    'html.lg-simple .status,html.lg-simple .verdict{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;cursor:pointer;position:relative}' +
    'html.lg-simple .status.lg-open,html.lg-simple .verdict.lg-open{display:block;-webkit-line-clamp:unset}' +
    'html.lg-simple .lg-more::after{content:"… Why? ▾";position:absolute;right:0;bottom:0;padding:0 10px 0 2.2em;font-weight:700;background:linear-gradient(90deg,transparent,var(--lg-bg,Canvas) 1.8em)}' +
    '.lg-mode{display:inline-flex;border:1.5px solid currentColor;border-radius:999px;overflow:hidden;font:700 13px/1 var(--body,system-ui,-apple-system,"Segoe UI",sans-serif);opacity:.9;vertical-align:middle}' +
    '.lg-mode button{border:0!important;background:none!important;color:inherit!important;padding:8px 12px!important;font:inherit!important;cursor:pointer;margin:0!important;width:auto!important;border-radius:0!important;text-transform:none!important;letter-spacing:normal!important}' +
    '.lg-mode button[aria-pressed="true"]{background:#0A6A88!important;color:#fff!important}' +
    '.lg-mode.float{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:60;background:Canvas;color:CanvasText;box-shadow:0 6px 18px rgba(0,0,0,.18)}' +
    '@keyframes lgPulse{0%{box-shadow:0 0 0 0 rgba(245,158,91,.9)}100%{box-shadow:0 0 0 14px rgba(245,158,91,0)}}' +
    'html.lg-simple .lg-start{animation:lgPulse 1.4s ease-out infinite;position:relative}' +
    'html.lg-simple .lg-start::after{content:"Start here";position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);background:#F59E5B;color:#1C1203;font:700 12px var(--body,system-ui,sans-serif);padding:3px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:5}' +
    '@media (prefers-reduced-motion: reduce){html.lg-simple .lg-start{animation:none;outline:3px solid #F59E5B;outline-offset:2px}}' +
    '@media print{.lg-mode{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- PhET-style phases: home screen + bottom navigation bar ----------
     Intro: the first tab only, the essential controls (the "simple" hide list), a "Start here" hint.
     Lab: every tab and every control.  Challenge: the lab's quiz / game tab on its own. */
  var root = document.documentElement, mode = 'simple';
  if (root.classList.contains('stage-ui') && window.LAB && window.LAB.screens) { stageNav(); return; }

  /* ---------- STAGE LAYOUT (DESIGN.md): one level of screens with real thumbnails, Reset bottom right ---------- */
  function stageNav() {
    var LAB = window.LAB, S = LAB.screens, stem = file.replace(/\.html$/, ''), LASTK = 'lg:last:' + file;
    var title = (document.querySelector('.topbar h1') || document.querySelector('h1') || {}).textContent || document.title;
    var tag = ((document.querySelector('.tb-tag') || {}).textContent || '').trim();
    var e3 = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var ICO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 36"><rect width="58" height="36" fill="#9AB0B8" opacity=".25"/><path d="M8 26 q7 -16 14 0 t14 0 t14 0" fill="none" stroke="#0A6A88" stroke-width="2.5"/></svg>');
    function thumb(id) { return 'url("thumbs/' + stem + '-' + id + '.jpg"),url("' + ICO + '")'; }
    var css =
      '.lg-nav{position:fixed;left:0;right:0;bottom:0;z-index:58;height:calc(var(--bar-h,64px) + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:8px;' +
      'padding:0 max(12px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(8px,env(safe-area-inset-left,0px));background:var(--surface);border-top:1px solid var(--line);color:var(--ink);font:700 13px/1 var(--body)}' +
      '.lg-nav .scr{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;min-width:0;flex:0 1 auto}.lg-nav .scr::-webkit-scrollbar{display:none}' +
      '.lg-nav button.ph{display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:none;color:var(--muted);padding:5px 7px;border-radius:8px;cursor:pointer;font:700 12.5px/1 var(--body);flex:none;min-width:0!important}' +
      '.lg-nav button.ph:hover{color:var(--ink)}' +
      '.lg-nav .th{width:60px;height:36px;border-radius:6px;border:2px solid var(--line);background-color:var(--sunk);background-position:center;background-size:cover;background-repeat:no-repeat;display:block}' +
      '.lg-nav button.ph[aria-current="true"]{color:var(--accent)}.lg-nav button.ph[aria-current="true"] .th{border-color:var(--accent)}' +
      '.lg-nav .home .th{background:none;border:0;display:flex;align-items:center;justify-content:center}.lg-nav .home svg{width:26px;height:26px}' +
      '.lg-nav .sp{flex:1 1 auto}' +
      '.lg-nav .btn-reset{flex:none;width:46px;height:46px;border-radius:50%;border:0;background:var(--reset);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.2);padding:0}' +
      '.lg-nav .btn-reset svg{width:24px;height:24px}.lg-nav .btn-reset:active{transform:translateY(1px)}' +
      '.lg-nav .lg-btn{position:static!important;box-shadow:none!important;height:42px;padding:0 14px!important;border-radius:999px;background:var(--accent)!important;color:var(--on-accent)!important}' +
      '.lg-nav .lg-btn .q{background:var(--on-accent)!important;color:var(--accent)!important}' +
      '.lg-nav .lg-btn{flex:none!important}' +
      '@media (max-width:560px){.lg-nav .scr{-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent);padding-right:18px}}' +
      '@media (max-width:560px){.lg-nav .lg-btn .gtxt{display:none}.lg-nav .lg-btn{width:42px!important;padding:0!important;justify-content:center}.lg-nav .th{width:44px;height:28px}.lg-nav button.ph{padding:4px 3px;font-size:13px}.lg-nav{gap:4px}.lg-nav .btn-reset{width:42px;height:42px}}' +
      '.lg-home{position:fixed;inset:0;z-index:80;background:var(--bg);color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(16px,3.5vh,32px);padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px));overflow:auto;font-family:var(--body)}' +
      '.lg-home .tg{margin:0;font:600 14px/1 var(--body);color:var(--muted);padding:7px 12px;border-radius:999px;background:var(--sunk)}' +
      '.lg-home h1{margin:0;font:800 clamp(30px,5vw,52px)/1.05 var(--display);text-align:center;letter-spacing:-.02em;text-wrap:balance}' +
      '.lg-home .cards{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:1100px}' +
      '.lg-home .card{width:min(240px,42vw);background:var(--surface);border:2px solid var(--line);border-radius:14px;padding:8px 8px 12px;color:inherit;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:8px;font:inherit;margin:0;transition:transform .12s,border-color .12s,box-shadow .12s}' +
      '.lg-home .card:hover,.lg-home .card:focus-visible{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 10px 24px rgba(19,35,43,.14);outline:none}' +
      '.lg-home .card .pic{display:block;aspect-ratio:16/10;border-radius:9px;background-color:var(--sunk);background-size:cover;background-position:center}' +
      '.lg-home .card b{font:800 20px/1.1 var(--display);padding:0 4px}' +
      '.lg-home .back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:700;font-size:14px;text-decoration:none;padding:9px 14px;border-radius:999px}.lg-home .back:hover{color:var(--ink);background:var(--sunk)}' +
      '.lg-nav .th{transition:border-color .2s,transform .25s cubic-bezier(.2,.7,.2,1)}.lg-nav button.ph[aria-current="true"] .th{transform:translateY(-2px)}.lg-nav button.ph:active .th{transform:scale(.95)}' +
      '.lg-nav .btn-reset{transition:filter .15s}.lg-nav .btn-reset:hover{filter:brightness(1.08)}.lg-nav .btn-reset.spin svg{animation:lgSpin .55s cubic-bezier(.3,.7,.3,1)}@keyframes lgSpin{to{transform:rotate(-360deg)}}' +
      '@keyframes lgRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
      '.lg-home .tg,.lg-home h1{animation:lgRise .45s cubic-bezier(.2,.7,.2,1) both}.lg-home .card{animation:lgRise .45s cubic-bezier(.2,.7,.2,1) both}.lg-home .card:nth-child(2){animation-delay:.06s}.lg-home .card:nth-child(3){animation-delay:.12s}.lg-home .card:nth-child(4){animation-delay:.18s}.lg-home .card:nth-child(5){animation-delay:.24s}.lg-home .card:nth-child(n+6){animation-delay:.3s}' +
      '.lg-home .card .pic{transition:transform .5s cubic-bezier(.2,.7,.2,1)}.lg-home .card{overflow:hidden}.lg-home .card:hover .pic{transform:scale(1.04)}' +
      '@media (prefers-reduced-motion: reduce){.lg-home .card{transition:none}.lg-home *,.lg-nav *{animation:none!important;transition:none!important}}@media print{.lg-nav,.lg-home{display:none}}';
    var st2 = document.createElement('style'); st2.textContent = css; document.head.appendChild(st2);

    var nav = document.createElement('nav'); nav.className = 'lg-nav'; nav.setAttribute('aria-label', 'Screens');
    nav.innerHTML = '<div class="scr"><button type="button" class="ph home" data-ph="home" aria-label="Home screen"><span class="th"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 L12 3 L21 11 V21 H14 V14 H10 V21 H3 Z" fill="currentColor"/></svg></span>Home</button>' +
      S.map(function (q) { return '<button type="button" class="ph" data-ph="' + q.id + '"><span class="th" style=\'background-image:' + thumb(q.id) + '\'></span>' + e3(q.name) + '</button>'; }).join('') +
      '</div><span class="sp"></span><button type="button" class="btn-reset" aria-label="Reset" title="Reset"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M4 3.5v5h5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    document.body.appendChild(nav);
    function moveGuide() { var g = document.querySelector('.lg-btn'); if (g && g.parentNode !== nav) { nav.appendChild(g); if (!g.querySelector('.gtxt')) g.innerHTML = g.innerHTML.replace('Guide', '<span class="gtxt">Guide</span>'); } }
    moveGuide(); setTimeout(moveGuide, 0);
    var rb = nav.querySelector('.btn-reset');
    rb.onclick = function () { rb.classList.remove('spin'); void rb.offsetWidth; rb.classList.add('spin'); if (typeof LAB.reset === 'function') LAB.reset(); else location.reload(); };
    rb.addEventListener('animationend', function () { rb.classList.remove('spin'); });

    var ids = S.map(function (q) { return q.id; });
    function setScreen(id, push) {
      var q = S[ids.indexOf(id)]; if (!q) return;
      var h = document.querySelector('.lg-home'); if (h) h.remove();
      root.setAttribute('data-phase', q.simple || id === 'intro' ? 'intro' : id);
      root.setAttribute('data-screen', id);
      document.querySelectorAll('.screen[data-screens]').forEach(function (s) { s.hidden = s.getAttribute('data-screens').split(/\s+/).indexOf(id) < 0; });
      if (q.tab) { var t = document.querySelector('[data-tab="' + q.tab + '"]'); if (t && t.getAttribute('aria-selected') !== 'true') t.click(); }
      nav.querySelectorAll('[data-ph]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.ph === id)); });
      try { localStorage.setItem(LASTK, id); } catch (e) { }
      if (push !== false) { try { history.replaceState(null, '', location.pathname + location.search + '#' + id); } catch (e) { } }
      root.classList.remove('st-anim'); void root.offsetWidth; root.classList.add('st-anim');
      if (typeof LAB.onScreen === 'function') LAB.onScreen(id);
      window.dispatchEvent(new Event('resize'));
    }
    function showHome() {
      var h = document.createElement('div'); h.className = 'lg-home'; h.setAttribute('role', 'dialog'); h.setAttribute('aria-label', title + ': choose a screen');
      h.innerHTML = (tag ? '<p class="tg">' + e3(tag) + '</p>' : '') + '<h1>' + e3(title) + '</h1><div class="cards">' +
        S.map(function (q) { return '<button type="button" class="card" data-ph="' + q.id + '"><span class="pic" style=\'background-image:' + thumb(q.id) + '\'></span><b>' + e3(q.name) + '</b></button>'; }).join('') +
        '</div><a class="back" href="index.html">← All simulations</a>';
      document.body.appendChild(h);
      h.querySelectorAll('[data-ph]').forEach(function (b) { b.onclick = function () { setScreen(b.dataset.ph); }; });
      var first = h.querySelector('.card'); if (first) first.focus();
      nav.querySelectorAll('[data-ph]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.ph === 'home')); });
    }
    nav.addEventListener('click', function (e) { var b = e.target.closest('[data-ph]'); if (!b) return; if (b.dataset.ph === 'home') showHome(); else setScreen(b.dataset.ph); });
    window.addEventListener('hashchange', function () { var h = (location.hash || '').slice(1); if (ids.indexOf(h) >= 0 && root.getAttribute('data-screen') !== h) setScreen(h, false); });

    // top-bar tools: Full screen and Dark mode, the same on every lab
    var KEYT = 'site-theme';   // one choice for the whole site (the homepage has the same button)
    try { var sv = localStorage.getItem(KEYT) || localStorage.getItem('lg-theme:' + file); if (sv === 'dark' || sv === 'light') root.setAttribute('data-theme', sv); } catch (e) { }
    function isDark() { var t = root.getAttribute('data-theme'); if (t) return t === 'dark'; return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
    var thb = document.querySelector('[data-tool="theme"]');
    function thLabel() { if (!thb) return; var s = thb.querySelector('span'); if (s) s.textContent = isDark() ? 'Light' : 'Dark'; thb.setAttribute('aria-label', isDark() ? 'Light mode' : 'Dark mode'); }
    if (thb) { thLabel(); thb.onclick = function () { var n = isDark() ? 'light' : 'dark'; root.classList.add('theme-fade'); root.setAttribute('data-theme', n); thb.classList.toggle('turn'); try { localStorage.setItem(KEYT, n); localStorage.setItem('lg-theme:' + file, n); } catch (e) { } thLabel(); window.dispatchEvent(new Event('resize')); setTimeout(function () { root.classList.remove('theme-fade'); }, 350); }; }
    var fsb = document.querySelector('[data-tool="fs"]');
    var fsEl = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
    if (fsb) {
      if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fsb.hidden = true;
      var fsLabel = function () { var s = fsb.querySelector('span'); if (s) s.textContent = fsEl() ? 'Exit' : 'Full screen'; setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 120); };
      fsb.onclick = function () { try { if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else { var p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root); if (p && p.catch) p.catch(function () { }); } } catch (e) { } };
      document.addEventListener('fullscreenchange', fsLabel); document.addEventListener('webkitfullscreenchange', fsLabel);
    }

    var start = (location.hash || '').slice(1), saved = null;
    try { saved = localStorage.getItem(LASTK); } catch (e) { }
    if (ids.indexOf(start) < 0 && ids.indexOf(saved) >= 0) start = saved;
    if (ids.indexOf(start) >= 0) setScreen(start, false); else { setScreen(ids[0], false); showHome(); }
  }

  var PH = {  // intro tab, challenge tab (null = none), names
    'chemical-change-lab.html': { intro: '[data-tab="signs"]', game: '[data-tab="bal"]', gameName: 'Balance it' },
    'chemical-equilibrium-lab.html': { intro: '[data-tab="box"]', game: '[data-tab="chal"]' },
    'enthalpy-lab.html': { intro: '#t-heat', game: null },
    'esterification-lab.html': { intro: '[data-tab="build"]', game: '[data-tab="chal"]' },
    'galvanic-cell-lab.html': { intro: '[data-tab="cell"]', game: '[data-tab="chal"]' },
    'keplers-laws.html': { intro: '#t-retro', game: null },
    'kinetics-lab.html': { intro: '[data-tab="lab"]', game: '[data-tab="chal"]' },
    'organic-naming-lab.html': { intro: '#t-build', game: '#t-quiz', gameName: 'Name challenge' },
    'reaction-rates-lab.html': { intro: '[data-tab="box"]', game: '[data-tab="chal"]' },
    'titration-lab.html': { intro: '[data-tab="dil"]', game: '[data-tab="chal"]' },
    'torque-lab.html': { intro: '[data-tab="door"]', game: '[data-tab="chal"]' },
    'wave-speed-lab.html': { intro: '[data-tab="lab"]', game: '[data-tab="chal"]' },
    'five-types-of-chemical-reactions.html': { intro: '[data-tab="build"]', game: '[data-tab="game"]' },
    'entropy-lab.html': { intro: '[data-tab="spr"]', game: '[data-tab="chal"]', gameName: 'Spontaneous?' },
    'equilibrium-table-lab.html': { intro: '[data-tab="step"]', game: '[data-tab="chal"]', gameName: 'You calculate' }
  };
  var ph = PH[file] || {};
  var tabBar = document.querySelector('[role="tablist"], .tabs');
  var hasTabs = !!(tabBar && ph.intro);
  var title = (document.querySelector('h1') || {}).textContent || document.title;
  var esc2 = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var eyebrow = ((document.querySelector('.eyebrow') || {}).textContent || '').trim();
  var LAST = 'lg:last:' + file;
  var PHASES = [
    { id: 'intro', name: 'Intro', desc: 'Start here: the main idea with only a few controls.' },
    { id: 'lab', name: 'Lab', desc: hasTabs ? 'Every tab, tool and option. Explore freely.' : 'Every tool and option, with explanations and teacher notes.' }
  ];
  if (ph.game) PHASES.push({ id: 'game', name: ph.gameName || 'Challenge', desc: 'Test yourself: questions with feedback and a score.' });
  var ICON = {
    intro: '<svg viewBox="0 0 120 80" aria-hidden="true"><rect width="120" height="80" rx="10" fill="#E3F1F5"/><circle cx="60" cy="40" r="18" fill="#0A6A88"/><path d="M54 30 L70 40 L54 50 Z" fill="#fff"/></svg>',
    lab: '<svg viewBox="0 0 120 80" aria-hidden="true"><rect width="120" height="80" rx="10" fill="#FCEFD9"/><path d="M48 14 h16 M52 14 v20 L36 64 q-2 4 3 4 h34 q5 0 3-4 L60 34 V14" fill="#fff" stroke="#8A5A12" stroke-width="3" stroke-linejoin="round"/><path d="M41 56 h30 l4 8 q1 4 -3 4 H40 q-4 0 -3-4z" fill="#F59E5B"/><circle cx="88" cy="26" r="9" fill="none" stroke="#8A5A12" stroke-width="3"/><path d="M88 13 v-4 M88 43 v-4 M75 26 h-4 M105 26 h-4" stroke="#8A5A12" stroke-width="3"/><path d="M84 52 h16 M84 60 h10" stroke="#8A5A12" stroke-width="3" stroke-linecap="round"/></svg>',
    game: '<svg viewBox="0 0 120 80" aria-hidden="true"><rect width="120" height="80" rx="10" fill="#EDE5FA"/><path d="M46 16 h28 v14 q0 16 -14 16 q-14 0 -14 -16z" fill="#F2B640" stroke="#7A5A10" stroke-width="2.5"/><path d="M46 20 h-8 q0 12 10 12 M74 20 h8 q0 12 -10 12" fill="none" stroke="#7A5A10" stroke-width="2.5"/><path d="M60 46 v10 M50 64 h20 v-8 h-20z" fill="#F2B640" stroke="#7A5A10" stroke-width="2.5"/><path d="M92 18 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z" fill="#8E5BC8"/></svg>'
  };
  css = '.lg-nav{position:fixed;left:0;right:0;bottom:0;z-index:58;display:flex;align-items:center;gap:6px;padding:6px max(12px,env(safe-area-inset-right,0px)) max(6px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));background:#13232B;color:#F5F6F2;box-shadow:0 -4px 16px rgba(0,0,0,.18);font:600 14px/1.1 var(--body,system-ui,-apple-system,"Segoe UI",sans-serif)}' +
    '.lg-nav .ttl{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:28vw;margin-right:auto}' +
    '.lg-nav button.ph{display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:none;color:#C9D4D8;padding:4px 8px;border-radius:8px;cursor:pointer;font:600 13.5px var(--body,system-ui,sans-serif);width:auto;margin:0;text-transform:none;letter-spacing:normal}' +
    '.lg-nav button.ph svg{width:46px;height:30px;border-radius:5px;opacity:.75;border:2px solid transparent}' +
    '.lg-nav button.ph[aria-current="true"]{color:#F59E5B}.lg-nav button.ph[aria-current="true"] svg{opacity:1;border-color:#F59E5B}' +
    '.lg-nav button.ph:focus-visible{outline:3px solid #F59E5B;outline-offset:1px}' +
    '.lg-nav .lg-btn{position:static!important;box-shadow:none;margin-left:6px!important;padding:9px 13px}' +
    '.lg-nav .home svg{width:26px;height:26px;opacity:1;border:0}' +
    '@media (max-width:560px){.lg-nav .ttl{display:none}.lg-nav{justify-content:center}.lg-nav button.ph svg{width:38px;height:25px}.lg-nav .lg-btn .gtxt{display:none}}' +
    'body{padding-bottom:78px!important}' +
    '.lg-home{position:fixed;inset:0;z-index:80;background-color:var(--bg,#F5F6F2);background-image:linear-gradient(var(--paper-line,rgba(19,35,43,.045)) 1px,transparent 1px),linear-gradient(90deg,var(--paper-line,rgba(19,35,43,.045)) 1px,transparent 1px);background-size:28px 28px;color:var(--ink,#13232B);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(14px,3vh,28px);padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px));overflow:auto;font-family:var(--body,system-ui,sans-serif)}' +
    '.lg-home .ey{margin:0;font:500 13px/1.3 var(--data,ui-monospace,monospace);color:var(--muted,#52646C);text-align:center;max-width:60ch}' +
    '.lg-home h1{margin:-6px 0 0;font:800 clamp(30px,5.5vw,54px)/1.05 var(--display,system-ui,sans-serif);text-align:center;letter-spacing:-.02em;text-wrap:balance}' +
    '.lg-home .sub{margin:0;color:var(--muted,#52646C);font-size:16px;text-align:center}' +
    '.lg-home .cards{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}' +
    '.lg-home .card{width:min(250px,80vw);background:var(--surface,#fff);border:2px solid var(--line,#D3DAD4);border-radius:16px;padding:12px 12px 14px;color:inherit;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:6px;font:inherit;margin:0;transition:transform .12s,border-color .12s,box-shadow .12s}' +
    '.lg-home .card:hover,.lg-home .card:focus-visible{border-color:var(--accent,#0A6A88);transform:translateY(-2px);box-shadow:0 8px 22px rgba(19,35,43,.12);outline:none}' +
    '.lg-home .card.last{border-color:var(--accent,#0A6A88)}' +
    '.lg-home .card svg{width:100%;height:auto;border-radius:10px}' +
    '.lg-home .card b{font:800 22px/1.15 var(--display,system-ui,sans-serif)}.lg-home .card span{color:var(--muted,#52646C);font-size:14.5px;line-height:1.4}' +
    '.lg-home .back{display:inline-flex;align-items:center;gap:6px;color:inherit;font-weight:700;font-size:14px;text-decoration:none;padding:8px 14px;border:1.5px solid currentColor;border-radius:999px;opacity:.85}.lg-home .back:hover,.lg-home .back:focus-visible{opacity:1}' +
    '@media (prefers-reduced-motion: reduce){.lg-home .card{transition:none}}' +
    '@media print{.lg-nav,.lg-home{display:none}}' +
    (hasTabs ? 'html[data-phase="intro"] ' + (tabBar.className ? '.' + tabBar.className.trim().split(/\s+/)[0] : '[role=tablist]') + ',html[data-phase="game"] ' + (tabBar.className ? '.' + tabBar.className.trim().split(/\s+/)[0] : '[role=tablist]') + '{display:none!important}' : '') +
    (ph.game ? 'html[data-phase="lab"] ' + ph.game + '{display:none!important}' : '');
  st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var nav = document.createElement('nav'); nav.className = 'lg-nav'; nav.setAttribute('aria-label', 'Screens');
  nav.innerHTML = '<span class="ttl">' + esc2(title) + '</span><button type="button" class="ph home" data-ph="home" aria-label="Home screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 L12 3 L21 11 V21 H14 V14 H10 V21 H3 Z" fill="#F5F6F2"/></svg>Home</button>' +
    PHASES.map(function (q) { return '<button type="button" class="ph" data-ph="' + q.id + '">' + ICON[q.id] + q.name + '</button>'; }).join('');
  document.body.appendChild(nav);
  function moveGuide() { var g = document.querySelector('.lg-btn'); if (g && g.parentNode !== nav) { nav.appendChild(g); if (!g.querySelector('.gtxt')) g.innerHTML = g.innerHTML.replace('Guide', '<span class="gtxt">Guide</span>'); } }
  moveGuide(); setTimeout(moveGuide, 0);

  function clickTab(sel) { var b = sel && document.querySelector(sel); if (b) b.click(); }
  function setPhase(id, push) {
    var home = document.querySelector('.lg-home'); if (home) home.remove();
    root.setAttribute('data-phase', id);
    try { localStorage.setItem(LAST, id); } catch (e) { }
    mode = id === 'intro' ? 'simple' : 'full';
    root.classList.toggle('lg-simple', mode === 'simple');
    if (id === 'intro' && hasTabs) clickTab(ph.intro);
    if (id === 'lab' && hasTabs) { var cur = tabBar.querySelector('[aria-selected="true"]'); if (!cur || (ph.game && cur.matches(ph.game))) clickTab(ph.intro); }
    if (id === 'game') clickTab(ph.game);
    nav.querySelectorAll('[data-ph]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.ph === id)); });
    if (push !== false) { try { history.replaceState(null, '', location.pathname + location.search + '#' + id); } catch (e) {} }
    window.scrollTo(0, 0); mark(); window.dispatchEvent(new Event('resize'));
  }
  function showHome() {
    var h = document.createElement('div'); h.className = 'lg-home'; h.setAttribute('role', 'dialog'); h.setAttribute('aria-label', title + ': choose a screen');
    var last = null; try { last = localStorage.getItem(LAST); } catch (e) { }
    h.innerHTML = (eyebrow ? '<p class="ey">' + esc2(eyebrow) + '</p>' : '') + '<h1>' + esc2(title) + '</h1><p class="sub">Where do you want to start?</p><div class="cards">' +
      PHASES.map(function (q) { return '<button type="button" class="card' + (q.id === last ? ' last' : '') + '" data-ph="' + q.id + '">' + ICON[q.id] + '<b>' + q.name + '</b><span>' + q.desc + (q.id === last ? ' <i>(where you were last time)</i>' : '') + '</span></button>'; }).join('') +
      '</div><a class="back" href="index.html">← All simulations</a>';
    document.body.appendChild(h);
    h.querySelectorAll('[data-ph]').forEach(function (b) { b.onclick = function () { setPhase(b.dataset.ph); }; });
    var first = h.querySelector('.card.last') || h.querySelector('.card'); if (first) first.focus();
    nav.querySelectorAll('[data-ph]').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.ph === 'home')); });
  }
  nav.addEventListener('click', function (e) { var b = e.target.closest('[data-ph]'); if (!b) return; if (b.dataset.ph === 'home') showHome(); else setPhase(b.dataset.ph); });
  // a lab tab clicked inside the page while in Lab keeps you in Lab; the old Simple/Full switch is gone
  var start = (location.hash || '').slice(1);
  var saved = null; try { saved = localStorage.getItem(LAST); } catch (e) { }
  if (!PHASES.some(function (q) { return q.id === start; }) && PHASES.some(function (q) { return q.id === saved; })) start = saved;   // back to the screen used last time; Home is one tap away
  if (PHASES.some(function (q) { return q.id === start; })) setPhase(start, false); else { root.setAttribute('data-phase', 'intro'); root.classList.add('lg-simple'); showHome(); }
  window.addEventListener('hashchange', function () { var h = (location.hash || '').slice(1); if (PHASES.some(function (q) { return q.id === h; }) && root.getAttribute('data-phase') !== h) setPhase(h, false); });

  // short feedback: mark the ones that are cut off, open them on tap
  function mark() {
    if (mode !== 'simple') return;
    document.querySelectorAll('.status,.verdict,p.note,p.caption').forEach(function (el) {
      if (el.classList.contains('lg-open')) return;
      var more = el.scrollHeight > el.clientHeight + 2; el.classList.toggle('lg-more', more);
      if (more && !el.style.getPropertyValue('--lg-bg')) { var n = el, bg = 'rgba(0, 0, 0, 0)'; while (n && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; } el.style.setProperty('--lg-bg', bg === 'rgba(0, 0, 0, 0)' ? 'Canvas' : bg); }
    });
  }
  document.addEventListener('click', function (e) {
    if (mode !== 'simple') return;
    var el = e.target.closest('.status,.verdict,p.note,p.caption'); if (!el || e.target.closest('button,a,input,select')) return;
    el.classList.toggle('lg-open'); el.classList.remove('lg-more'); if (!el.classList.contains('lg-open')) mark();
  });
  if ('MutationObserver' in window) {
    var t = null; new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () {
      document.querySelectorAll('.status.lg-open,.verdict.lg-open').forEach(function (el) { if (el.dataset.lgText !== el.textContent) { el.classList.remove('lg-open'); } });
      document.querySelectorAll('.status,.verdict').forEach(function (el) { el.dataset.lgText = el.textContent; });
      mark(); }, 60); }).observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  setTimeout(mark, 300);

  // one clear first action
  if (cfg.start) {
    var go = document.querySelector(cfg.start);
    if (go) { go.classList.add('lg-start'); var off = function () { go.classList.remove('lg-start'); go.removeEventListener('click', off, true); }; go.addEventListener('click', off, true); }
  }
})();

/* phones: the intro text under the title is cut to three lines (site.css); a tap opens or closes it */
(function () {
  function hook() { document.querySelectorAll('.wrap > header .lede').forEach(function (el) { if (el.dataset.tap) return; el.dataset.tap = '1'; el.addEventListener('click', function () { el.classList.toggle('open'); }); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();

/* the same page tools on every lab: Full screen and Dark mode in the top right.
   A lab that already has its own button keeps it; this only adds what is missing. */
(function () {
  var file = (location.pathname.split('/').pop() || 'index.html');
  var KEY = 'lg-theme:' + file;
  var root = document.documentElement;
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function hook() {
    var header = document.querySelector('.wrap > header');
    if (!header || header.dataset.lgTools) return;
    header.dataset.lgTools = '1';
    var txt = function (re) { return Array.prototype.some.call(header.querySelectorAll('button'), function (b) { return re.test(b.textContent); }); };
    var needTheme = !document.getElementById('themeBtn') && !txt(/dark mode|light mode/i);
    var needFs = !document.getElementById('fsBtn') && !txt(/full screen/i) && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
    if (!needTheme && !needFs) return;

    // where the buttons go: next to the page's own buttons, or in a new box on the right
    var box = (document.getElementById('themeBtn') || document.getElementById('fsBtn') || {}).parentElement || header.querySelector('.head-actions,.tools,.row');
    if (!box || !header.contains(box)) {
      var kids = Array.prototype.slice.call(header.children);
      if (kids.every(function (k) { return /^(P|H1|H2)$/.test(k.tagName); })) {
        var text = document.createElement('div');
        kids.forEach(function (k) { text.appendChild(k); });
        header.appendChild(text);
        header.classList.add('lg-hd');
      }
      box = document.createElement('div');
      box.className = 'lg-tools';
      header.appendChild(box);
      header.classList.add('lg-hd');
    }
    if (box.classList.contains('head-actions')) {   // a column with its own note: our buttons get a row at the top
      var row = document.createElement('div'); row.className = 'lg-tools'; box.insertBefore(row, box.firstChild); box = row;
    }
    var cls = box.querySelector('.btn') ? 'btn' + (box.querySelector('.btn.small') ? ' small' : '') : 'lg-tool';
    function make(label) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; return b; }

    if (needFs) {
      var fs = make('Full screen');
      var fsEl = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
      var sync = function () { fs.textContent = fsEl() ? 'Exit full screen' : 'Full screen'; setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 120); };
      fs.addEventListener('click', function () {
        try {
          if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          else { var p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root); if (p && p.catch) p.catch(function () {}); }
        } catch (e) {}
      });
      document.addEventListener('fullscreenchange', sync); document.addEventListener('webkitfullscreenchange', sync);
      box.insertBefore(fs, box.firstChild);
    }
    if (needTheme) {
      var th = make('Dark mode');
      try { var saved = localStorage.getItem('site-theme') || localStorage.getItem(KEY); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}
      var label = function () { th.textContent = isDark() ? 'Light mode' : 'Dark mode'; };
      th.addEventListener('click', function () {
        var n = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', n);
        try { localStorage.setItem(KEY, n); localStorage.setItem('site-theme', n); } catch (e) {}
        label();
        window.dispatchEvent(new Event('resize'));   // labs that draw on a canvas redraw with the new colours
      });
      if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', label); }
      label();
      box.appendChild(th);
    }
  }
  var css = document.createElement('style');
  css.textContent =
    '.wrap > header.lg-hd{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px 16px}' +
    '.wrap > header.lg-hd > div:first-child{flex:1 1 320px;min-width:0}' +
    '.lg-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.lg-tool{font:700 14px/1 var(--body,system-ui,sans-serif);min-height:40px;padding:0 16px;border-radius:999px;border:1.5px solid var(--line,#D3DAD4);background:var(--surface,#FBFBF8);color:var(--ink,#13232B);cursor:pointer;white-space:nowrap}' +
    '.lg-tool:hover{border-color:var(--accent,#0A6A88);color:var(--accent,#0A6A88)}' +
    '.lg-tool:focus-visible{outline:3px solid var(--accent,#0A6A88);outline-offset:2px}' +
    '@media (any-pointer:coarse){.lg-tool{min-height:44px}}';
  document.head.appendChild(css);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
