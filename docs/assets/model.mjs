export const MAX_ALBUMS=10,MAX_PHOTOS=30;
const ID=/^[a-zA-Z0-9_-]{1,64}$/;
const PATH=/^media\/[a-zA-Z0-9_-]+(?:-thumb)?\.jpg$/;
function text(v,max){return typeof v==='string'&&v.length<=max;}
export function validatePortfolio(data){
  if(!data||data.version!==1||!data.site||!Array.isArray(data.albums)||data.albums.length>MAX_ALBUMS)throw Error('Format du portfolio invalide.');
  for(const [key,max] of Object.entries({title:120,artist:120,quote:600,email:160}))if(!text(data.site[key],max))throw Error('Informations du site invalides.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.site.email))throw Error('Adresse de contact invalide.');
  const ids=new Set(),paths=new Set();
  for(const a of data.albums){
    if(!ID.test(a.id)||ids.has(a.id)||!text(a.title,120)||!a.title.trim()||!text(a.quote,600)||!Array.isArray(a.photos)||a.photos.length>MAX_PHOTOS)throw Error('Thème invalide.');
    ids.add(a.id);const photoIds=new Set();
    for(const p of a.photos){
      if(!ID.test(p.id)||photoIds.has(p.id)||!PATH.test(p.src)||!PATH.test(p.thumb)||paths.has(p.src)||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width>2400||p.height>2400)throw Error('Photographie invalide.');
      photoIds.add(p.id);paths.add(p.src);
    }
    if(a.photos.length&&!photoIds.has(a.cover))throw Error('Couverture invalide.');
  }
  return data;
}
export function visibleAlbums(data){return data.albums.filter(a=>a.photos.length>0);}
export function coverPhoto(album){return album.photos.find(p=>p.id===album.cover)||album.photos[0];}
export function routeAlbum(hash,albums){if(!hash.startsWith('#theme/'))return null;try{return albums.find(a=>a.id===decodeURIComponent(hash.slice(7)))||null;}catch{return null;}}
