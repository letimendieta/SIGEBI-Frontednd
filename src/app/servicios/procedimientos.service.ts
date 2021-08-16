import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProcedimientoModelo } from '../modelos/procedimiento.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { ProcesoProcedimientoModelo } from '../modelos/procesoProcedimiento.modelo';
import { ProcedimientoInsumoModelo } from '../modelos/procedimientoInsumo.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProcedimientosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearProcedimiento( procesoProcedimientoInsumo: ProcesoProcedimientoModelo ) {

    return this.http.post(`${ this.url }/procedimientos`, procesoProcedimientoInsumo);

  }

  actualizarProcedimiento( procesoProcedimientoInsumo: ProcesoProcedimientoModelo ) {

    const procedimientoTemp = {
      ...procesoProcedimientoInsumo
    };

    return this.http.put(`${ this.url }/procedimientos/`, procedimientoTemp);
  }

  borrarProcedimiento( id: number ) {

    return this.http.delete(`${ this.url }/procedimientos/${ id }`);
  }


  getProcedimiento( id: number ) {

    return this.http.get(`${ this.url }/procedimientos/${ id }`);
  }


  getProcedimientos() {
    return this.http.get(`${ this.url }/procedimientos`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarProcedimientos() {
    return this.http.get(`${ this.url }/procedimientos/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarProcedimientosFiltros( pregunta: ProcedimientoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = pregunta == null ? new ProcedimientoModelo() : pregunta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/procedimientos/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarProcedimientosFiltrosTabla( procedimiento: ProcedimientoModelo ) {
    let params = new HttpParams();
    var filtros = procedimiento == null ? new ProcedimientoModelo() : procedimiento;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/procedimientos/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  obtenerProcedimientosInsumos( procedimientoInsumo: ProcedimientoInsumoModelo ) {
    let params = new HttpParams();
    var filtros = procedimientoInsumo == null ? new ProcedimientoInsumoModelo() : procedimientoInsumo;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/procedimientos-insumos/buscar/`,{params:params})
      .pipe(
        map( this.crearArregloProcedimientoInsumo ),
        delay(0)
      );
  }

  obtenerProcedimientosInsumosPaciente( pacienteId: number ) {

    return this.http.get(`${ this.url }/procedimientos-insumos/paciente/${ pacienteId }`).pipe(
      map( this.crearArregloProcedimientoInsumo ),
      delay(0)
    );
  }

  obtenerProcedimientoPaciente( pacienteId: number ) {

    return this.http.get(`${ this.url }/procedimientos/paciente/${ pacienteId }`).pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  getPersona( id: number ) {

    return this.http.get(`${ this.url }/personas/${ id }`);

  }

  private crearArreglo( procedimientosObj: object ) {

    const procedimientos: ProcedimientoModelo[] = [];

    Object.keys( procedimientosObj ).forEach( key => {

      const procedimiento: ProcedimientoModelo = procedimientosObj[key];
      procedimientos.push( procedimiento );
    });

    return procedimientos;
  }

  private crearArregloProcedimientoInsumo( procedimientosObj: object ) {

    const procedimientos: ProcedimientoInsumoModelo[] = [];

    Object.keys( procedimientosObj ).forEach( key => {

      const procedimiento: ProcedimientoInsumoModelo = procedimientosObj[key];
      procedimientos.push( procedimiento );
    });

    return procedimientos;
  }
}
