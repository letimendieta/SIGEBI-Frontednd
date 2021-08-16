import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PacienteModelo } from '../modelos/paciente.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { ProcesoPacienteHistorialClinicoModelo } from '../modelos/procesoPacienteHistorialClinico.modelo';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearPaciente( paciente: PacienteModelo ) {

    return this.http.post(`${ this.url }/pacientes`, paciente);

  }

  crearPacienteHistorialClinico( pacienteHistorialClinico: ProcesoPacienteHistorialClinicoModelo ) {

    return this.http.post(`${ this.url }/pacientes/paciente-historial-clinico`, pacienteHistorialClinico);

  }

  actualizarPacienteHistorialClinico( pacienteHistorialClinico: ProcesoPacienteHistorialClinicoModelo ) {

    return this.http.put(`${ this.url }/pacientes/paciente-historial-clinico`, pacienteHistorialClinico);

  }

  actualizarPaciente( paciente: PacienteModelo ) {

    const pacienteTemp = {
      ...paciente
    };

    return this.http.put(`${ this.url }/pacientes/`, pacienteTemp);
  }

  borrarPaciente( id: number ) {

    return this.http.delete(`${ this.url }/pacientes/${ id }`);
  }


  getPaciente( id: number ) {

    return this.http.get(`${ this.url }/pacientes/${ id }`);
  }


  getPacientes() {
    return this.http.get(`${ this.url }/pacientes`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPacientes() {
    return this.http.get(`${ this.url }/pacientes/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarPacientesFiltros( motivoConsulta: PacienteModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = motivoConsulta == null ? new PacienteModelo() : motivoConsulta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/pacientes/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarPacientesFiltrosOrder( motivoConsulta: PacienteModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = motivoConsulta == null ? new PacienteModelo() : motivoConsulta;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/pacientes/buscar/`,{params:params});
  }

  buscarPacientesFiltrosTabla( paciente: PacienteModelo ) {
    let params = new HttpParams();
    var filtros = paciente == null ? new PacienteModelo() : paciente;
    params = params.append('filtros', JSON.stringify(filtros));

    return this.http.get(`${ this.url }/pacientes/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  getPersona( id ) {

    return this.http.get(`${ this.url }/personas/${ id }`);

  }

  private crearArreglo( pacientesObj: object ) {

    const pacientes: PacienteModelo[] = [];

    Object.keys( pacientesObj ).forEach( key => {

      const paciente: PacienteModelo = pacientesObj[key];
      pacientes.push( paciente );
    });

    return pacientes;
  }
}
