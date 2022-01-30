const _clues = function(){
    let rates = {
        Easy: [],
        Medium: [],
        Hard: [],
        Elite: [],
        Master: []
    }

    let tasks = {
        Easy: [5,10,15,20,23,26,29,32,35,38,41,45,49,53,57,61,64,67,70,73,75,77,79,81],
        Medium: [5,10,13,16,19,22,25,28,31,36,41,46,51,55,59,63,67,71,74,77,80,82],
        Hard: [3,6,9,12,15,20,25,30,35,40,45,50,55,60,65,70,74,78,82,86,90,94,96,98,100,102,104,106,107,108,109,110,111,112,113,114,115,116,117,118],
        Elite: [4,8,12,16,20,23,26,29,32,35,38,41,44,47,50,52,54,56,58,59,60,61,62,63,64,65,66,67,68,69,70,71],
        Master: [5,10,15,20,25,29,33,37,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65]
    }
    $(document).ready(() => {
        $('#sim_action').on('change', function(){
            const action = $(this).val();

            $(`.simOptions`).css('display','none');
            $(`.simOptions[simAction="${action}"]`).css('display','block');
        });

        $('.simSubmit').on('click', function(){
            const parentAction = $(this).parent().attr('simAction');
            const tier = $('#sim_tier').val();
            
            if(parentAction == "roll_single"){
                const result = simulate(tier,1);
                console.log(result);

                let output = `You opened 1 casket containing ${result.totalItemRolls} items in total for ${result.obtained.length}/${rates[tier].length} unique log items. You received ${result.dupes.total} duplicate log items.`;
                if(result.obtained.length){
                    output += `<br>Items rolled: 
                                                <table><tr><th>Unique #</th><th>Item</th><th>Casket</th><th>Duplicates</th><th>Drop rate</th></tr>
                                                ${result.obtained.map((c,i) => `<tr>
                                                                                    <td>${i+1}</td>
                                                                                    <td>${c}</td>
                                                                                    <td>${result.progress[i+1]}</td>
                                                                                    <td>${(result.dupes.items[c]??0)}</td>
                                                                                    <td>1/${rates[tier].filter(u => u.item==c)[0].rate}</td>
                                                                                </tr>`).join("")}</table>`;
                }
                $('.simOutput').html(output);
            }
            else if(parentAction == "roll_multi"){
                const numCaskets = $('#roll_multi_input').val();

                if(isNaN(numCaskets) || numCaskets < 1){
                    alert(`The number of casket must be a number greater than 0.`);
                    return;
                }
                
                const result = simulate(tier,numCaskets);
                console.log(result);

                let output = `You opened ${numCaskets} caskets containing ${result.totalItemRolls} items in total for ${result.obtained.length}/${rates[tier].length} unique log items. You received ${result.dupes.total} duplicate log items.`;
                if(result.obtained.length){
                    output += `<br>Items rolled: 
                                                <table><tr><th>Unique #</th><th>Item</th><th>Casket</th><th>Duplicates</th><th>Drop rate</th></tr>
                                                ${result.obtained.map((c,i) => `<tr>
                                                                                    <td>${i+1}</td>
                                                                                    <td>${c}</td>
                                                                                    <td>${result.progress[i+1]}</td>
                                                                                    <td>${(result.dupes.items[c]??0)}</td>
                                                                                    <td>1/${rates[tier].filter(u => u.item==c)[0].rate}</td>
                                                                                </tr>`).join("")}</table>`;
                }
                $('.simOutput').html(output);
            }
            else if(parentAction == "roll_log"){
                const result = simulate(tier);
                console.log(result);

                let output = `You opened ${result.iterations} caskets containing ${result.totalItemRolls} items in total for ${result.obtained.length}/${rates[tier].length} unique log items. You received ${result.dupes.total} duplicate log items.`;
                if(result.obtained.length){
                    output += `<br>Items rolled: 
                                                <table><tr><th>Unique #</th><th>Item</th><th>Casket</th><th>Duplicates</th><th>Drop rate</th></tr>
                                                ${result.obtained.map((c,i) => `<tr>
                                                                                    <td>${i+1}</td>
                                                                                    <td>${c}</td>
                                                                                    <td>${result.progress[i+1]}</td>
                                                                                    <td>${(result.dupes.items[c]??0)}</td>
                                                                                    <td>1/${rates[tier].filter(u => u.item==c)[0].rate}</td>
                                                                                </tr>`).join("")}</table>`;
                }
                $('.simOutput').html(output);
            }
            else if(parentAction == "roll_nth"){
                const numUniques = $('#roll_nth_input').val();
                
                if(isNaN(numUniques) || numUniques < 1 || numUniques > rates[tier].length){
                    alert(`The number of uniques must be a number from 1 to ${rates[tier].length}.`);
                    return;
                }

                const result = simulate(tier,Infinity,numUniques);
                console.log(result);
                let output = `You opened ${result.iterations} caskets containing ${result.totalItemRolls} items in total for ${result.obtained.length}/${rates[tier].length} unique log items. You received ${result.dupes.total} duplicate log items.`;
                if(result.obtained.length){
                    output += `<br>Items rolled: 
                                                <table><tr><th>Unique #</th><th>Item</th><th>Casket</th><th>Duplicates</th><th>Drop rate</th></tr>
                                                ${result.obtained.map((c,i) => `<tr>
                                                                                    <td>${i+1}</td>
                                                                                    <td>${c}</td>
                                                                                    <td>${result.progress[i+1]}</td>
                                                                                    <td>${(result.dupes.items[c]??0)}</td>
                                                                                    <td>1/${rates[tier].filter(u => u.item==c)[0].rate}</td>
                                                                                </tr>`).join("")}</table>`;
                }
                $('.simOutput').html(output);
            }
        });

        $.ajax({
            url: 'data.csv',
            success: function(data){
                const rows = data.split("\n");
                
                let currentTier = null;

                rows.forEach(row => {
                    row = row.split(",");
                    // console.log(row);
                    if(row[1] == "\r"){
                        currentTier = row[0]; 
                        console.log(`Current Tier: ${currentTier}`);
                        return;
                    }

		    let m = 1;
		    if(currentTier=="Easy") m=3;
		    if(currentTier=="Medium") m=4;

                    rates[currentTier].push({
                        item: row[0],
                        rate: m*parseInt(row[1])
                    });
                });

                
                for(k in rates){
                    let sumChance = 0;
                    rates[k].forEach(item => {
                        let c = 1/item.rate;
                        sumChance += c;
                        item.rateSum = sumChance;
                    });
                }

                console.log(rates);

            }
        });
    });

    const roll = (tier,number) => {
        let table = rates[tier];

        let rolls = [];

        if(!number){
            if(tier == "Easy") number = 2 + ~~(Math.random()*3);
            if(tier == "Medium") number = 3 + ~~(Math.random()*3);
            if(tier == "Hard") number = 4 + ~~(Math.random()*3);
            if(tier == "Elite") number = 4 + ~~(Math.random()*3);
            if(tier == "Master") number = 4 + ~~(Math.random()*3);
        }

        for(let i=0; i<number; i++){
            let r = Math.random();
            let rolledItem = table.filter(x => x.rateSum>r)[0];
            if(rolledItem){
                // rolls.push({
                //     r: r,
                //     item: rolledItem
                // });

                rolls.push(rolledItem.item);
            }
        }
        return {
            rollCount: number,
            rolls: rolls
        }
    }

    const simulate = (tier,stopAt=Infinity,stopAtUniques) => {
        let uniquesObtained = [];
        let progress = [];
        let iteration = 1;
        let totalItemRolls = 0;
        let dupes = {
            total: 0,
            items: {}
        }

        // console.log(`Stopping at ${stopAtUniques} uniques`);

        while(iteration <= stopAt && uniquesObtained.length < rates[tier].length && (!stopAtUniques || (stopAtUniques && uniquesObtained.length < stopAtUniques))){
            const r = roll(tier);
            totalItemRolls += r.rollCount;

            r.rolls.forEach(item => {
                if(!uniquesObtained.includes(item)){
                    uniquesObtained.push(item);
                    progress[uniquesObtained.length] = iteration;
                }
                else{
                    dupes.total++;
                    if(!dupes.items[item]){
                        dupes.items[item] = 0;
                    }
                    dupes.items[item]++;
                }
            });

            iteration++;
        }

        return{
            obtained: uniquesObtained,
            progress: progress,
            iterations: iteration-1,
            totalItemRolls: totalItemRolls,
            dupes: dupes
        }
    }

    const averageForNthUnique = (tier,n,iterations) => {
        let casketSum = 0;

        for(let i=0; i<iterations; i++){
            const s = simulate(tier,Infinity,n);
            const caskets = s.iterations;
            casketSum += caskets;
        }

        casketSum /= iterations;

        return casketSum;
    }

    const averageForFullProgress = (tier,iterations) => {
        let progressAverage = Array(rates[tier].length+1).fill(0);
        let progressMin = Array(rates[tier].length+1).fill(Infinity);
        let progressMax = Array(rates[tier].length+1).fill(0);
        const start = Date.now();

        for(let i=0; i<iterations; i++){
            if(i%50 == 0){
                const elapsed = ~~((Date.now() - start)/1000);
                const progDisp = Array(20).fill(0).map((a,j) => {
                    if(j/20 < i/iterations){
                        return "|";
                    }
                    return " ";
                }).join("");
                console.log(`Progress: [${progDisp}] (${elapsed}s)`);
            }

            const sim = simulate(tier);
            const p = sim.progress;

            p.forEach((n,index) => {
                progressAverage[index] += n;

                if(n > progressMax[index]){
                    progressMax[index] = n;
                }

                if(n < progressMin[index]){
                    progressMin[index] = n;
                }
            });
        }

        let indexedAverage = {};
        let indexedMin = {};
        let indexedMax = {};

        for(let i=0; i<progressAverage.length; i++){
            progressAverage[i] = progressAverage[i]/iterations;
            indexedAverage[i] = progressAverage[i];
            indexedMin[i] = progressMin[i];
            indexedMax[i] = progressMax[i];
        }

       
        return {
            avg: indexedAverage,
            min: indexedMin,
            max: indexedMax
        }
    }

    return{
        roll,
        simulate,
        averageForNthUnique,
        averageForFullProgress
    }
}();