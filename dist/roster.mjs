export const CHARACTERS={
 wargo:{id:'wargo',name:'Wargo',description:'Floppy olive outback hat, gray hair, black sunglasses, burgundy tee, khaki shorts',shirt:'#722c3d',skin:'#d5a085',hair:'#777b78'},
 pekalsky:{id:'pekalsky',name:'Pekalsky',description:'Thick dark hair, green Squam Lakes sweatshirt, blue jeans',shirt:'#405549',skin:'#cca081',hair:'#302a25'},
 saunders:{id:'saunders',name:'Saunders',description:'Blue C baseball cap, beige Henley, coral shorts',shirt:'#bcb39e',skin:'#c79a78',hair:'#5e4835'},
 rose:{id:'rose',name:'Rose',description:'Red baseball cap, broad smile, black polo, khaki shorts',shirt:'#1f2829',skin:'#d4a08a',hair:'#74746b'},
 martens:{id:'martens',name:'Martens',description:'Sandy brown hair, black sunglasses, red Nantucket tee, light shorts',shirt:'#ad575a',skin:'#d8ab90',hair:'#8d785b'},
 rueben:{id:'rueben',name:'Rueben',description:'Full dark hair, white-framed sunglasses, white graphic tee',shirt:'#f0eee3',skin:'#b88768',hair:'#2f2624'},
 colman:{id:'colman',name:'Colman',description:'Swept-up salt-and-pepper hair, burgundy polo, dark jeans',shirt:'#682f42',skin:'#d3aa91',hair:'#7b7e75'},
 recker:{id:'recker',name:'Recker',description:'Blue C baseball cap, black sunglasses, pale shirt',shirt:'#b9b2a1',skin:'#c79b7d',hair:'#4f3e31'},
 att:{id:'att',name:'Att',description:'Close dark hair, dark goatee, black sunglasses, red shirt',shirt:'#a92f3a',skin:'#b78768',hair:'#2b2420'},
 wilkins:{id:'wilkins',name:'Wilkins',description:'Tousled silver-gray hair, open smile, navy tee, khaki trousers',shirt:'#18212c',skin:'#d2a18a',hair:'#9b9c90'},
 graham:{id:'graham',name:'Graham',description:'Blue T baseball cap, black sunglasses, navy graphic tee, teal shorts',shirt:'#1e324b',skin:'#c29578',hair:'#6c6e64'},
 lefko:{id:'lefko',name:'Lefko',description:'Red baseball cap, thin metal glasses, gray-blue tee, khaki shorts',shirt:'#75949f',skin:'#d2a58d',hair:'#8a8b83'},
 levitt:{id:'levitt',name:'Levitt',description:'Salt-and-pepper spiked hair, sunglasses on head, gray graphic tee',shirt:'#999ea2',skin:'#c49b86',hair:'#737873'},
 heard:{id:'heard',name:'Heard',description:'Balding head, black sunglasses, bright blue long-sleeve shirt',shirt:'#2396bd',skin:'#c58e73',hair:'#63564e'},
 dauenheimer:{id:'dauenheimer',name:'Dauenheimer',description:'Receding dark hair, full salt-and-pepper beard, charcoal Coast Guard Park tee, dark shorts',shirt:'#343c3d',skin:'#c79576',hair:'#4c4843'},
 watson:{id:'watson',name:'Watson',description:'Skinny build, brown hair, charcoal West Point Army shirt',shirt:'#252729',skin:'#d4ab8d',hair:'#654634'},
 tubby:{id:'tubby',name:'Tubby',description:'Parted light-brown hair, dark jacket, light-blue shirt and pale pink patterned tie',shirt:'#192129',skin:'#ddb29d',hair:'#87774e'},
 brodeur:{id:'brodeur',name:'Brodeur',description:'Bald head, salt-and-pepper goatee, red-white-blue checked button-down shirt',shirt:'#e0dfd5',skin:'#c5987e',hair:'#514a40'},
 komar:{id:'komar',name:'Komar',description:'Short brown hair, dark rectangular glasses, light rolled-sleeve button-down shirt and blue jeans',shirt:'#d8d0b8',skin:'#cba18b',hair:'#624b35'},
 rooks:{id:'rooks',name:'Rooks',description:'Short and stout barbecue chef, sandy-blond hair, red-check shirt and dark apron',shirt:'#a65b42',skin:'#d1a286',hair:'#b39a6c'},

};
export const SUPPORTING_CHARACTERS={cindy:{id:'cindy',name:'Cindy',description:'Dark wavy shoulder-length hair, warm smile and black top; stands behind Graham',shirt:'#191b21',skin:'#d2a18b',hair:'#302323'}};
export const seatCast=['house','wargo','pekalsky','saunders','rose','martens','rueben','house','house'];
export const HOUSE_NAMES=['You','Maggie','Jack','Rosa','Eddie','June','Finn','Bea','Lou'];
export function assignCharacter(cast,seat,id){if(id!=='house'&&!CHARACTERS[id])return;for(let i=1;i<cast.length;i++)if(i!==seat&&id!=='house'&&cast[i]===id)cast[i]='house';cast[seat]=id}

export function choosePongCast(seatedIds,rng=Math.random){const occupied=new Set(seatedIds),available=Object.keys(CHARACTERS).filter(id=>!occupied.has(id)),chosen=[];while(chosen.length<2&&available.length)chosen.push(available.splice(Math.floor(rng()*available.length),1)[0]);return chosen;}
