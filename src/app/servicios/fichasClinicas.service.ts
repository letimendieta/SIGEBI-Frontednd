import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FichaClinicaModelo } from '../modelos/fichaClinica.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class FichasClinicasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearFichaClinica( fichaClinica: FichaClinicaModelo ) {

    return this.http.post(`${ this.url }/fichasClinicas`, fichaClinica);

  }

  actualizarFichaClinica( fichaClinica: FichaClinicaModelo ) {

    const FichaClinicaTemp = {
      ...fichaClinica
    };

    return this.http.put(`${ this.url }/fichasClinicas/`, FichaClinicaTemp);


  }

  borrarFichaClinica( id: number ) {

    return this.http.delete(`${ this.url }/fichasClinicas/${ id }`);

  }


  getFichaClinica( id: number ) {

    return this.http.get(`${ this.url }/fichasClinicas/${ id }`);

  }


  getFichaClinicas() {
    return this.http.get(`${ this.url }/fichasClinicas`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarFichaClinicas() {
    return this.http.get(`${ this.url }/fichasClinicas/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarFichaClinicasFiltros( fichaClinica: FichaClinicaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = fichaClinica == null ? new FichaClinicaModelo() : fichaClinica;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/fichasClinicas/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarFichaClinicasFiltrosTabla( fichaClinica: FichaClinicaModelo ) {
    let params = new HttpParams();
    var filtros = fichaClinica == null ? new FichaClinicaModelo() : fichaClinica;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/fichasClinicas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( FichaClinicasObj: object ) {

    const fichasClinicas: FichaClinicaModelo[] = [];

    Object.keys( FichaClinicasObj ).forEach( key => {

      const fichaClinica: FichaClinicaModelo = FichaClinicasObj[key];
      fichasClinicas.push( fichaClinica );
    });

    return fichasClinicas;

  }
}
