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
        'Watch Ice melts. Predict the sign of ΔS before you choose.',
        'Use Next change → to try at least four different changes.',
        'Find a change where ΔS < 0. What happened to the number of gas particles?',
        'Change the temperature: when does a change with ΔH > 0 and ΔS > 0 become spontaneous?'
      ],
      words: [['Entropy S', 'number of possible arrangements'], ['ΔS', 'change in entropy'], ['Spontaneous', 'happens without continuous outside help'], ['ΔG = ΔH − TΔS', 'decides spontaneity']],
      goals: ['Predict the sign of ΔS from changes of state, dissolving and moles of gas.', 'Use ΔG = ΔH − TΔS to decide when a change is spontaneous.'],
      flow: [['3 min', 'Predict', 'A messy room vs a tidy room: which has more arrangements?'], ['6 min', 'Explore', 'Students try every change and record the sign of ΔS.'], ['3 min', 'Explain', 'Sort the changes into ΔS > 0 and ΔS < 0 on the board.'], ['3 min', 'Apply', 'Temperature slider: find the temperature where ice melts.']],
      mis: [['Entropy is “disorder” you can see.', 'Count arrangements of particles and energy, not messiness.'], ['Spontaneous means fast.', 'Spontaneity says nothing about the rate.']],
      qs: ['Why does dissolving salt usually increase entropy?', 'Why does water freeze below 0 °C even though ΔS < 0?']
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
        'Mystery compounds: identify one bottle with as few tests as possible.'
      ],
      words: [['Parent chain', 'the longest carbon chain'], ['Substituent', 'a branch or group on the chain'], ['Functional group', 'the reactive part, e.g. –OH, –COOH'], ['Isomers', 'same formula, different structure']],
      goals: ['Name and draw alkanes, alkenes, alkynes, rings and compounds with functional groups.', 'Recognise structural and functional isomers.', 'Use lab tests to identify a family.'],
      flow: [['2 min', 'Predict', 'Show two structures with the same formula. Same compound?'], ['6 min', 'Explore', 'Build & name in pairs.'], ['4 min', 'Explain', 'Isomer hunt on the board.'], ['3 min', 'Apply', 'Mystery compounds.']],
      mis: [['The longest chain is the one drawn straight.', 'The builder counts bends too.'], ['Numbering always starts from the left.', 'Lowest locants decide the direction.']],
      qs: ['Why do butane and 2-methylpropane boil at different temperatures?', 'Which test separates an aldehyde from a ketone?']
    },
    'pulse-at-a-boundary.html': {
      big: 'When a pulse reaches a boundary, part reflects and part is transmitted. A heavier (slower) medium flips the reflected pulse; a lighter one does not.',
      tryThis: [
        'Choose Heavier → lighter. Is the reflected pulse upright or inverted?',
        'Now Lighter → heavier. What changed?',
        'Rigid wall: how much passes through?',
        'Same spring: why is there no reflection?',
        'Turn on labels and compare the sizes of reflected and transmitted pulses.'
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
        'Redox: titrate Fe²⁺ with KMnO₄. What tells you the end point without an indicator?'
      ],
      words: [['Dilution factor f', 'C₀ / C = V / V₀'], ['Volumetric flask', 'holds exactly V at the line'], ['Equivalence point', 'reagents in stoichiometric ratio'], ['End point', 'where the indicator changes colour'], ['Concordant', 'trials within 0.10 mL']],
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

  var css = '' +
    '.lg-btn{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;' +
    'font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;padding:12px 16px;border-radius:999px;border:0;cursor:pointer;background:#0A6A88;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.22)}' +
    '.lg-btn:focus-visible,.lg-x:focus-visible,.lg-tab:focus-visible,.lg-pres:focus-visible{outline:3px solid #F59E5B;outline-offset:2px}' +
    '.lg-btn .q{width:20px;height:20px;border-radius:50%;background:#fff;color:#0A6A88;display:inline-flex;align-items:center;justify-content:center;font-size:13px}' +
    '.lg-back{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:70}' +
    '.lg-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:71;background:Canvas;color:CanvasText;box-shadow:-10px 0 30px rgba(0,0,0,.25);display:flex;flex-direction:column;' +
    'font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding-top:env(safe-area-inset-top,0px)}' +
    '.lg-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 16px 8px}' +
    '.lg-head b{font-size:18px}' +
    '.lg-x{border:1.5px solid color-mix(in srgb,CanvasText 25%,transparent);background:none;color:inherit;border-radius:9px;padding:6px 12px;font:600 14px system-ui;cursor:pointer}' +
    '.lg-tabs{display:flex;gap:4px;padding:0 16px;border-bottom:1.5px solid color-mix(in srgb,CanvasText 18%,transparent)}' +
    '.lg-tab{border:0;background:none;color:inherit;opacity:.65;padding:10px 12px;font:700 15px system-ui;border-bottom:3px solid transparent;margin-bottom:-1.5px;cursor:pointer}' +
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
    '.lg-pres{align-self:flex-start;border:1.5px solid #0A6A88;background:none;color:inherit;border-radius:9px;padding:8px 12px;font:700 14px system-ui;cursor:pointer}' +
    'html.lg-present{font-size:125%}html.lg-present body{font-size:1.15em}html.lg-present .lede,html.lg-present footer{display:none!important}' +
    '.lg-btn,.lg-panel button{width:auto!important;min-width:0!important;margin:0!important;text-transform:none!important;letter-spacing:normal!important;flex:none}' +
    '.lg-btn{left:auto!important;top:auto!important}' +
    '.lg-panel label{width:auto!important;margin:0!important;text-transform:none!important;letter-spacing:normal!important;font-size:inherit!important;color:inherit!important}' +
    '@media print{.lg-btn{display:none}}';
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
      '<h3>Words to know</h3><div class="lg-words">' + G.words.map(function (w) { return '<span><b>' + esc(w[0]) + '</b>: ' + esc(w[1]) + '</span>'; }).join('') + '</div>';
  }
  function teacherHTML() {
    return '<button type="button" class="lg-pres" id="lgPres"></button>' +
      '<h3>Learning goals: students will be able to</h3><ol class="lg-ol">' + G.goals.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ol>' +
      '<h3>15-minute lesson</h3><ul class="lg-flow">' + G.flow.map(function (f) { return '<li><span class="t">' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b><span>' + esc(f[2]) + '</span></li>'; }).join('') + '</ul>' +
      '<h3>Common misconceptions</h3><ul class="lg-mis">' + G.mis.map(function (m) { return '<li>“' + esc(m[0]) + '”<small>How the lab shows it: ' + esc(m[1]) + '</small></li>'; }).join('') + '</ul>' +
      '<h3>Discussion questions</h3><ol class="lg-ol">' + G.qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>';
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
