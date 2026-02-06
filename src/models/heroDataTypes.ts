/* eslint-disable @typescript-eslint/naming-convention */
export interface HeroWeekData {
	week: number
	win_percent: number
	pick_percent: number
	ban_percent: number
}
export interface HeroDataChunk {
	// 0 = HERALD, 1 = GUARDIAN, 2 = CRUSADER, 3 = ARCHON, 4 = LEGEND, 5 = ANCIENT, 6 = DIVINE
	rank_chunk: number
	week_data: HeroWeekData[]
}
// example:
// {
//     "hero_id": 1,
//     "hero_data_per_chunk": [
//         {
//             "rank_chunk": 0,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.5123900175094604,
//                     "pick_percent": 0.1731400042772293,
//                     "ban_percent": 0.20726999640464783
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.5133600234985352,
//                     "pick_percent": 0.16962000727653503,
//                     "ban_percent": 0.20408999919891357
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.515209972858429,
//                     "pick_percent": 0.16311000287532806,
//                     "ban_percent": 0.20340000092983246
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.5081700086593628,
//                     "pick_percent": 0.1639299988746643,
//                     "ban_percent": 0.20040999352931976
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.5039100050926208,
//                     "pick_percent": 0.16333000361919403,
//                     "ban_percent": 0.19851000607013702
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.5144400000572205,
//                     "pick_percent": 0.15825000405311584,
//                     "ban_percent": 0.20024999976158142
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.519599974155426,
//                     "pick_percent": 0.15910999476909637,
//                     "ban_percent": 0.19894999265670776
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.5161700248718262,
//                     "pick_percent": 0.15863999724388123,
//                     "ban_percent": 0.19933000206947327
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 1,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.516539990901947,
//                     "pick_percent": 0.17666000127792358,
//                     "ban_percent": 0.25306999683380127
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.5060200095176697,
//                     "pick_percent": 0.17279000580310822,
//                     "ban_percent": 0.25014999508857727
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.5057899951934814,
//                     "pick_percent": 0.16875000298023224,
//                     "ban_percent": 0.24955999851226807
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.5049600005149841,
//                     "pick_percent": 0.16825999319553375,
//                     "ban_percent": 0.24798999726772308
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.504859983921051,
//                     "pick_percent": 0.16540999710559845,
//                     "ban_percent": 0.24408000707626343
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.5138099789619446,
//                     "pick_percent": 0.16503000259399414,
//                     "ban_percent": 0.24133999645709991
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.5060300230979919,
//                     "pick_percent": 0.1661199927330017,
//                     "ban_percent": 0.24426999688148499
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.5163499712944031,
//                     "pick_percent": 0.16503000259399414,
//                     "ban_percent": 0.24461999535560608
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 2,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.5109900236129761,
//                     "pick_percent": 0.16301999986171722,
//                     "ban_percent": 0.2726300060749054
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.5041700005531311,
//                     "pick_percent": 0.15940000116825104,
//                     "ban_percent": 0.2703399956226349
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.5020300149917603,
//                     "pick_percent": 0.15440000593662262,
//                     "ban_percent": 0.2717899978160858
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.5080599784851074,
//                     "pick_percent": 0.15765999257564545,
//                     "ban_percent": 0.2642199993133545
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.5052800178527832,
//                     "pick_percent": 0.15321999788284302,
//                     "ban_percent": 0.2592499852180481
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.5075399875640869,
//                     "pick_percent": 0.15591000020503998,
//                     "ban_percent": 0.2561100125312805
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.5083699822425842,
//                     "pick_percent": 0.1542699933052063,
//                     "ban_percent": 0.26058998703956604
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.5113300085067749,
//                     "pick_percent": 0.1521800011396408,
//                     "ban_percent": 0.2603900134563446
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 3,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.5115900039672852,
//                     "pick_percent": 0.15059000253677368,
//                     "ban_percent": 0.2758300006389618
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.5042799711227417,
//                     "pick_percent": 0.14508000016212463,
//                     "ban_percent": 0.27351000905036926
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.5000200271606445,
//                     "pick_percent": 0.14285999536514282,
//                     "ban_percent": 0.27366000413894653
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.5038700103759766,
//                     "pick_percent": 0.14377999305725098,
//                     "ban_percent": 0.2663699984550476
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.5007500052452087,
//                     "pick_percent": 0.1409900039434433,
//                     "ban_percent": 0.26374000310897827
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.5090500116348267,
//                     "pick_percent": 0.14102999866008759,
//                     "ban_percent": 0.259909987449646
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.506879985332489,
//                     "pick_percent": 0.14138999581336975,
//                     "ban_percent": 0.26298001408576965
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.5053499937057495,
//                     "pick_percent": 0.14037999510765076,
//                     "ban_percent": 0.26072001457214355
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 4,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.5051900148391724,
//                     "pick_percent": 0.13755999505519867,
//                     "ban_percent": 0.2727000117301941
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.5033800005912781,
//                     "pick_percent": 0.13404999673366547,
//                     "ban_percent": 0.26822999119758606
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.4979900121688843,
//                     "pick_percent": 0.12869000434875488,
//                     "ban_percent": 0.26949000358581543
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.49744999408721924,
//                     "pick_percent": 0.13027000427246094,
//                     "ban_percent": 0.2604900002479553
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.4933600127696991,
//                     "pick_percent": 0.12896999716758728,
//                     "ban_percent": 0.2546199858188629
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.5038700103759766,
//                     "pick_percent": 0.12937000393867493,
//                     "ban_percent": 0.25589001178741455
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.4954499900341034,
//                     "pick_percent": 0.13015000522136688,
//                     "ban_percent": 0.25710999965667725
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.5064499974250793,
//                     "pick_percent": 0.12789000570774078,
//                     "ban_percent": 0.2545900046825409
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 5,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.49845999479293823,
//                     "pick_percent": 0.12430000305175781,
//                     "ban_percent": 0.2640700042247772
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.4977700114250183,
//                     "pick_percent": 0.12336000055074692,
//                     "ban_percent": 0.25499001145362854
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.4952999949455261,
//                     "pick_percent": 0.12003999948501587,
//                     "ban_percent": 0.2589400112628937
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.49340999126434326,
//                     "pick_percent": 0.11747000366449356,
//                     "ban_percent": 0.249439999461174
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.48938998579978943,
//                     "pick_percent": 0.12090999633073807,
//                     "ban_percent": 0.24241000413894653
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.4927699863910675,
//                     "pick_percent": 0.12150999903678894,
//                     "ban_percent": 0.23924000561237335
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.5004600286483765,
//                     "pick_percent": 0.12129999697208405,
//                     "ban_percent": 0.24216000735759735
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.49911999702453613,
//                     "pick_percent": 0.11808999627828598,
//                     "ban_percent": 0.24619999527931213
//                 }
//             ]
//         },
//         {
//             "rank_chunk": 6,
//             "talent_win_rates": [],
//             "hero_averages": 0,
//             "graph_data": [],
//             "week_data": [
//                 {
//                     "week": 8,
//                     "win_percent": 0.4944800138473511,
//                     "pick_percent": 0.11108999699354172,
//                     "ban_percent": 0.21589000523090363
//                 },
//                 {
//                     "week": 7,
//                     "win_percent": 0.49810999631881714,
//                     "pick_percent": 0.10843999683856964,
//                     "ban_percent": 0.20825999975204468
//                 },
//                 {
//                     "week": 6,
//                     "win_percent": 0.4814800024032593,
//                     "pick_percent": 0.10486999899148941,
//                     "ban_percent": 0.2149599939584732
//                 },
//                 {
//                     "week": 5,
//                     "win_percent": 0.48927998542785645,
//                     "pick_percent": 0.10165999829769135,
//                     "ban_percent": 0.20336000621318817
//                 },
//                 {
//                     "week": 4,
//                     "win_percent": 0.484499990940094,
//                     "pick_percent": 0.1010499969124794,
//                     "ban_percent": 0.20076000690460205
//                 },
//                 {
//                     "week": 3,
//                     "win_percent": 0.49090999364852905,
//                     "pick_percent": 0.10582999885082245,
//                     "ban_percent": 0.19397999346256256
//                 },
//                 {
//                     "week": 2,
//                     "win_percent": 0.49140000343322754,
//                     "pick_percent": 0.10520000010728836,
//                     "ban_percent": 0.19966000318527222
//                 },
//                 {
//                     "week": 1,
//                     "win_percent": 0.49347999691963196,
//                     "pick_percent": 0.10153999924659729,
//                     "ban_percent": 0.19673000276088715
//                 }
//             ]
//         }
//     ]
// }
export interface HeroDataResponse {
	hero_id: number
	hero_data_per_chunk: HeroDataChunk[]
}

/** Returns the latest week entry (smallest week number, e.g. week 1) from chunk.week_data */
export function getLatestWeekData(chunk: HeroDataChunk): HeroWeekData | undefined {
	if (!chunk.week_data?.length) {
		return undefined
	}
	return chunk.week_data.reduce((a, b) => (a.week <= b.week ? a : b))
}
