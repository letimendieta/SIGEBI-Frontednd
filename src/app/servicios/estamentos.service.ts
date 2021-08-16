import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EstamentoModelo } from '../modelos/estamento.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class EstamentosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearEstamento( estamento: EstamentoModelo ) {

    return this.http.post(`${ this.url }/estamentos`, estamento);

  }

  actualizarEstamento( estamento: EstamentoModelo ) {

    const EstamentoTemp = {
      ...estamento
    };

    return this.http.put(`${ this.url }/estamentos/`, EstamentoTemp);


  }

  borrarEstamento( id: number ) {

    return this.http.delete(`${ this.url }/estamentos/${ id }`);

  }


  getEstamento( id: number ) {

    return this.http.get(`${ this.url }/estamentos/${ id }`);

  }


  getEstamentos() {
    return this.http.get(`${ this.url }/estamentos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarEstamentos() {
    return this.http.get(`${ this.url }/estamentos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarEstamentosFiltros( estamento: EstamentoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = estamento == null ? new EstamentoModelo() : estamento;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');


    return this.http.get(`${ this.url }/estamentos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarEstamentosFiltrosOrder( estamento: EstamentoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = estamento == null ? new EstamentoModelo() : estamento;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');


    return this.http.get(`${ this.url }/estamentos/buscar/`,{params:params});
  }

  buscarEstamentosFiltrosTabla( estamento: EstamentoModelo ) {
    let params = new HttpParams();
    var filtros = estamento == null ? new EstamentoModelo() : estamento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/estamentos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( EstamentosObj: object ) {

    const estamentos: EstamentoModelo[] = [];

    Object.keys( EstamentosObj ).forEach( key => {

      const estamento: EstamentoModelo = EstamentosObj[key];
      estamentos.push( estamento );
    });

    return estamentos;

  }
}
