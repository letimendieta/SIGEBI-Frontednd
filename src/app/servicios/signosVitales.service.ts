import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignoVitalModelo } from '../modelos/signoVital.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class SignosVitalesService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearSignoVital( signoVital: SignoVitalModelo ) {

    return this.http.post(`${ this.url }/signos-vitales`, signoVital);

  }

  actualizarSignoVital( SignoVital: SignoVitalModelo ) {

    const signoVitalTemp = {
      ...SignoVital
    };

    return this.http.put(`${ this.url }/signos-vitales/`, signoVitalTemp);
  }

  borrarSignoVital( id: number ) {

    return this.http.delete(`${ this.url }/signos-vitales/${ id }`);
  }


  getSignoVital( id: number ) {

    return this.http.get(`${ this.url }/signos-vitales/${ id }`);
  }


  getSignosVitales() {
    return this.http.get(`${ this.url }/signos-vitales`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarSignosVitales() {
    return this.http.get(`${ this.url }/signos-vitales/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarSignosVitalesFiltros( pregunta: SignoVitalModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new SignoVitalModelo() : pregunta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/signos-vitales/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarSignosVitalesFiltrosTabla( signoVital: SignoVitalModelo ) {
    let params = new HttpParams();
    var filtros = signoVital == null ? new SignoVitalModelo() : signoVital;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/signos-vitales/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  obtenerSignosVitalesInsumos( signoVitalInsumo: SignoVitalModelo ) {
    let params = new HttpParams();
    var filtros = signoVitalInsumo == null ? new SignoVitalModelo() : signoVitalInsumo;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/signos-vitales-insumos/buscar/`,{params:params})
      .pipe(
        map( this.crearArregloSignoVitalInsumo ),
        delay(0)
      );
  }

  getPersona( id: number ) {

    return this.http.get(`${ this.url }/personas/${ id }`);

  }

  private crearArreglo( signosVitalesObj: object ) {

    const signosVitales: SignoVitalModelo[] = [];

    Object.keys( signosVitalesObj ).forEach( key => {

      const signoVital: SignoVitalModelo = signosVitalesObj[key];
      signosVitales.push( signoVital );
    });

    return signosVitales;
  }

  private crearArregloSignoVitalInsumo( signosVitalesObj: object ) {

    const signosVitales: SignoVitalModelo[] = [];

    Object.keys( signosVitalesObj ).forEach( key => {

      const signoVital: SignoVitalModelo = signosVitalesObj[key];
      signosVitales.push( signoVital );
    });

    return signosVitales;
  }
}
