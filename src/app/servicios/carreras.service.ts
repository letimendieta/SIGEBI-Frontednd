import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarreraModelo } from '../modelos/carrera.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class CarrerasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearCarrera( carrera: CarreraModelo ) {

    return this.http.post(`${ this.url }/carreras`, carrera);

  }

  actualizarCarrera( carrera: CarreraModelo ) {

    const CarreraTemp = {
      ...carrera
    };

    return this.http.put(`${ this.url }/carreras/`, CarreraTemp);


  }

  borrarCarrera( id: number ) {

    return this.http.delete(`${ this.url }/carreras/${ id }`);

  }


  getCarrera( id: number ) {

    return this.http.get(`${ this.url }/carreras/${ id }`);

  }


  getCarreras() {
    return this.http.get(`${ this.url }/carreras`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarCarreras() {
    return this.http.get(`${ this.url }/carreras/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarCarrerasFiltros( carrera: CarreraModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = carrera == null ? new CarreraModelo() : carrera;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/carreras/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarCarrerasFiltrosOrder( carrera: CarreraModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = carrera == null ? new CarreraModelo() : carrera;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/carreras/buscar/`,{params:params});
  }

  buscarCarrerasFiltrosTabla( carrera: CarreraModelo ) {
    let params = new HttpParams();
    var filtros = carrera == null ? new CarreraModelo() : carrera;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/carreras/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );

  }

  private crearArreglo( CarrerasObj: object ) {

    const carreras: CarreraModelo[] = [];

    Object.keys( CarrerasObj ).forEach( key => {

      const carrera: CarreraModelo = CarrerasObj[key];
      carreras.push( carrera );
    });

    return carreras;

  }
}
