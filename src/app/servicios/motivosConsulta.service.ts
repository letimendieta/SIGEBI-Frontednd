import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MotivoConsultaModelo } from '../modelos/motivoConsulta.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class MotivosConsultaService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearMotivoConsulta( motivoConsulta: MotivoConsultaModelo ) {

    return this.http.post(`${ this.url }/motivos-consulta`, motivoConsulta);

  }

  actualizarMotivoConsulta( motivoConsulta: MotivoConsultaModelo ) {

    const MotivoConsultaTemp = {
      ...motivoConsulta
    };

    return this.http.put(`${ this.url }/motivos-consulta/`, MotivoConsultaTemp);


  }

  borrarMotivoConsulta( id: number ) {

    return this.http.delete(`${ this.url }/motivos-consulta/${ id }`);

  }


  getMotivoConsulta( id: number ) {

    return this.http.get(`${ this.url }/motivos-consulta/${ id }`);

  }


  getMotivoConsultas() {
    return this.http.get(`${ this.url }/motivos-consulta`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarMotivoConsultas() {
    return this.http.get(`${ this.url }/motivos-consulta/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarMotivosConsultaFiltros( motivoConsulta: MotivoConsultaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = motivoConsulta == null ? new MotivoConsultaModelo() : motivoConsulta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/motivos-consulta/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarMotivosConsultaFiltrosTabla( motivoConsulta: MotivoConsultaModelo ) {
    let params = new HttpParams();
    var filtros = motivoConsulta == null ? new MotivoConsultaModelo() : motivoConsulta;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/motivos-consulta/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( MotivoConsultasObj: object ) {

    const motivosConsulta: MotivoConsultaModelo[] = [];

    Object.keys( MotivoConsultasObj ).forEach( key => {

      const motivoConsulta: MotivoConsultaModelo = MotivoConsultasObj[key];
      motivosConsulta.push( motivoConsulta );
    });

    return motivosConsulta;

  }
}
