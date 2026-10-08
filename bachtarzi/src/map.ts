import { geoBounds, geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import topo from 'world-atlas/countries-50m.json';

// Projection fixe en pixels d'écran ; la « caméra » du film zoome/déplace ensuite le groupe.
export const projection = geoMercator()
  .center([19, 26])
  .scale(1700)
  .translate([960, 560])
  .clipExtent([[-2600, -2200], [4600, 3400]]);

const path = geoPath(projection);

export const place = {
  kabylie: projection([4.05, 36.72]) as [number, number],   // Tizi Ouzou
  alger: projection([3.06, 36.75]) as [number, number],     // Belcourt est un quartier d'Alger
  caire: projection([31.24, 30.04]) as [number, number],
  soudan: projection([32.53, 15.55]) as [number, number],   // Khartoum (repère du pays)
};

interface Country { name: string; d: string; key: boolean }
const KEY = new Set(['Algeria', 'Egypt', 'Sudan']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t: any = topo;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fc: any = feature(t, t.objects.countries);

export const countries: Country[] = fc.features
  .filter((f: any) => {
    const [[x0, y0], [x1, y1]] = geoBounds(f);
    return x1 > -25 && x0 < 70 && y1 > -8 && y0 < 60;
  })
  .map((f: any) => ({ name: f.properties.name as string, d: path(f) || '', key: KEY.has(f.properties.name) }))
  .filter((c: Country) => c.d.length > 0);

export const graticuleD = path(geoGraticule10()) || '';
