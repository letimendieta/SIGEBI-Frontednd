import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AreaModelo } from '../modelos/area.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class AreasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearArea( area: AreaModelo ) {

    return this.http.post(`${ this.url }/areas`, area);

  }

  actualizarArea( area: AreaModelo ) {

    const AreaTemp = {
      ...area
    };

    return this.http.put(`${ this.url }/areas/`, AreaTemp);


  }

  borrarArea( id: number ) {

    return this.http.delete(`${ this.url }/areas/${ id }`);

  }


  getArea( id: number ) {

    return this.http.get(`${ this.url }/areas/${ id }`);

  }


  getAreas() {
    return this.http.get(`${ this.url }/areas`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarAreas() {
    return this.http.get(`${ this.url }/areas/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarAreasFiltros( area: AreaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = area == null ? new AreaModelo() : area;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/areas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarAreasFiltrosOrder( area: AreaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = area == null ? new AreaModelo() : area;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/areas/buscar/`,{params:params});
  }

  buscarAreasFiltrosTabla( area: AreaModelo ) {
    let params = new HttpParams();
    var filtros = area == null ? new AreaModelo() : area;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/areas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( AreasObj: object ) {

    const areas: AreaModelo[] = [];

    Object.keys( AreasObj ).forEach( key => {

      const area: AreaModelo = AreasObj[key];
      areas.push( area );
    });

    return areas;

  }
}
