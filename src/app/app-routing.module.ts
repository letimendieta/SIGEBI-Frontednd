import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './general/layouts/default/default.component';
import { LoginComponent } from './vistas/formularios/login/login.component';
import { PersonasComponent } from './vistas/listas/personas/personas.component';
import { PersonaComponent } from './vistas/formularios/persona/persona.component';
import { PacientesComponent } from './vistas/listas/pacientes/pacientes.component';
import { PacienteComponent } from './vistas/formularios/paciente/paciente.component';
import { FuncionariosComponent } from './vistas/listas/funcionarios/funcionarios.component';
import { FuncionarioComponent } from './vistas/formularios/funcionario/funcionario.component';
import { ParametrosComponent } from './vistas/listas/parametros/parametros.component';
import { ParametroComponent } from './vistas/formularios/parametro/parametro.component';
import { ProcedimientosComponent } from './vistas/listas/procedimientos/procedimientos.component';
import { ProcedimientoComponent } from './vistas/formularios/procedimiento/procedimiento.component';
import { UsuariosComponent } from './vistas/listas/usuarios/usuarios.component';
import { UsuarioComponent } from './vistas/formularios/usuario/usuario.component';
import { AreasComponent } from './vistas/listas/areas/areas.component';
import { AreaComponent } from './vistas/formularios/area/area.component';
import { MotivosConsultaComponent } from './vistas/listas/motivosConsulta/motivosConsulta.component';
import { MotivoConsultaComponent } from './vistas/formularios/motivoConsulta/motivoConsulta.component';
import { CarrerasComponent } from './vistas/listas/carreras/carreras.component';
import { CarreraComponent } from './vistas/formularios/carrera/carrera.component';
import { DepartamentosComponent } from './vistas/listas/departamentos/departamentos.component';
import { DepartamentoComponent } from './vistas/formularios/departamento/departamento.component';
import { DependenciaComponent } from './vistas/formularios/dependencia/dependencia.component';
import { DependenciasComponent } from './vistas/listas/dependencias/dependencias.component';
import { EstamentoComponent } from './vistas/formularios/estamento/estamento.component';
import { EstamentosComponent } from './vistas/listas/estamentos/estamentos.component';
import { CitaComponent } from './vistas/formularios/cita/cita.component';
import { CitasComponent } from './vistas/listas/citas/citas.component';
import { HorarioComponent } from './vistas/formularios/horario/horario.component';
import { HorariosComponent } from './vistas/listas/horarios/horarios.component';
import { StockComponent } from './vistas/formularios/stock/stock.component';
import { StocksComponent } from './vistas/listas/stocks/stocks.component';
import { InsumoComponent } from './vistas/formularios/insumo/insumo.component';
import { InsumosComponent } from './vistas/listas/insumos/insumos.component';
import { MedicamentoComponent } from './vistas/formularios/medicamento/medicamento.component';
import { MedicamentosComponent } from './vistas/listas/medicamentos/medicamentos.component';
import { SignosVitalesComponent } from 'src/app/vistas/listas/signosVitales/signosVitales.component';
import { SignoVitalComponent } from 'src/app/vistas/formularios/signoVital/signoVital.component';
import { EnfermedadesCie10Component } from 'src/app/vistas/listas/enfermedadesCie10/enfermedadesCie10.component';
import { EnfermedadCie10Component } from 'src/app/vistas/formularios/enfermedadCie10/enfermedadCie10.component';
import { ConsultorioComponent } from 'src/app/vistas/formularios/consultorio/consultorio.component';
import { EnfermeriaComponent } from 'src/app/vistas/formularios/enfermeria/enfermeria.component';
import { ReportesComponent } from 'src/app/vistas/formularios/reportes/reportes.component';
import { PersonasGuardService as personasguard } from 'src/app/guards/personas-guard.service';
import { PacientesGuardService as pacientesguard } from 'src/app/guards/pacientes-guard.service';
import { SignosVitalesGuardService as signosvitalesguard } from 'src/app/guards/signosVitales-guard.service';
import { FuncionariosGuardService as funcinariosguard } from 'src/app/guards/funcionarios-guard.service';
import { ProcedimientosGuardService as procedimientosguard } from 'src/app/guards/procedimientos-guard.service';
import { UsuariosGuardService as usuariosguard } from 'src/app/guards/usuarios-guard.service';
import { CarrerasGuardService as carrerasguard } from 'src/app/guards/carreras-guard.service';
import { AreasGuardService as areasguard } from 'src/app/guards/areas-guard.service';
import { DepartamentosGuardService as departamentosguard } from 'src/app/guards/departamentos-guard.service';
import { DependenciasGuardService as dependenciasguard } from 'src/app/guards/dependencias-guard.service';
import { EstamentosGuardService as estamentosguard } from 'src/app/guards/estamentos-guard.service';
import { MotivosConsultaGuardService as motivosConsultaguard } from 'src/app/guards/motivosConsulta-guard.service';
import { EnfermedadesCie10GuardService as enfermedadescie10guard } from 'src/app/guards/enfermedadesCie10-guard.service';
import { ParametrosGuardService as parametrosguard } from 'src/app/guards/parametros-guard.service';
import { StockGuardService as stockguard } from 'src/app/guards/stock-guard.service';
import { ConsultorioGuardService as consultorioguard } from 'src/app/guards/consultorio-guard.service';
import { EnfermeriaGuardService as enfermeriaguard } from 'src/app/guards/enfermeria-guard.service';
import { ReportesGuardService as reportesguard } from 'src/app/guards/reportes-guard.service';
import { AyudaGuardService as ayudaguard } from 'src/app/guards/ayuda-guard.service';
import { AyudaComponent } from './vistas/formularios/ayuda/ayuda.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
  path: 'inicio',
  component: DefaultComponent,
  children: [
  {
    path: 'ayuda',canActivate: [ayudaguard], data: { expectedRol: ['admin', 'ayuda'] },
    component: AyudaComponent
  },
  {
    path: 'personas',canActivate: [personasguard], data: { expectedRol: ['admin', 'personas'] },
    component: PersonasComponent
  },{
    path: 'persona/:id',canActivate: [personasguard], data: { expectedRol: ['admin', 'persona'] },
    component: PersonaComponent
  },
  {
    path: 'pacientes',canActivate: [pacientesguard], data: { expectedRol: ['admin', 'pacientes'] },
    component: PacientesComponent
  },{
    path: 'paciente/:id',canActivate: [pacientesguard], data: { expectedRol: ['admin', 'paciente'] },
    component: PacienteComponent
  },
  {
    path: 'signosVitales',canActivate: [signosvitalesguard], data: { expectedRol: ['admin', 'pacientes'] },
    component: SignosVitalesComponent
  },{
    path: 'signoVital/:id',canActivate: [signosvitalesguard], data: { expectedRol: ['admin', 'paciente'] },
    component: SignoVitalComponent
  }, 
  {
    path: 'citas',canActivate: [pacientesguard], data: { expectedRol: ['admin', 'pacientes'] },
    component: CitasComponent
  },{
    path: 'cita/:id',canActivate: [pacientesguard], data: { expectedRol: ['admin', 'paciente'] },
    component: CitaComponent
  },  
  {
    path: 'funcionarios',canActivate: [funcinariosguard], data: { expectedRol: ['admin', 'funcionarios'] },
    component: FuncionariosComponent
  },{
    path: 'funcionario/:id',canActivate: [funcinariosguard], data: { expectedRol: ['admin', 'funcionario'] },
    component: FuncionarioComponent
  },
  {
    path: 'horarios',canActivate: [funcinariosguard], data: { expectedRol: ['admin', 'funcionarios'] },
    component: HorariosComponent
  },{
    path: 'horario/:id',canActivate: [funcinariosguard], data: { expectedRol: ['admin', 'funcionarios'] },
    component: HorarioComponent
  },  
  {
    path: 'procedimientos',canActivate: [procedimientosguard], data: { expectedRol: ['admin', 'procedimientos'] },
    component: ProcedimientosComponent
  },{
    path: 'procedimiento/:id',canActivate: [procedimientosguard], data: { expectedRol: ['admin', 'procedimiento'] },
    component: ProcedimientoComponent
  },
  {
    path: 'usuarios',canActivate: [usuariosguard], data: { expectedRol: ['admin', 'usuarios'] },
    component: UsuariosComponent
  },{
    path: 'usuario/:id',canActivate: [usuariosguard], data: { expectedRol: ['admin', 'usuario'] },
    component: UsuarioComponent
  },
  {
    path: 'areas',canActivate: [areasguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: AreasComponent
  },{
    path: 'area/:id',canActivate: [areasguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: AreaComponent
  },
  {
    path: 'carreras',canActivate: [carrerasguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: CarrerasComponent
  },{
    path: 'carrera/:id',canActivate: [carrerasguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: CarreraComponent
  },
  {
    path: 'departamentos',canActivate: [departamentosguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: DepartamentosComponent
  },{
    path: 'departamento/:id',canActivate: [departamentosguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: DepartamentoComponent
  },
  {
    path: 'dependencias',canActivate: [dependenciasguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: DependenciasComponent
  },{
    path: 'dependencia/:id',canActivate: [dependenciasguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: DependenciaComponent
  },
  {
    path: 'estamentos',canActivate: [estamentosguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: EstamentosComponent
  },{
    path: 'estamento/:id',canActivate: [estamentosguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: EstamentoComponent
  },
  {
    path: 'motivosConsulta',canActivate: [motivosConsultaguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: MotivosConsultaComponent
  },{
    path: 'motivoConsulta/:id',canActivate: [motivosConsultaguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: MotivoConsultaComponent
  },
  {
    path: 'enfermedadesCie10',canActivate: [enfermedadescie10guard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: EnfermedadesCie10Component
  },{
    path: 'enfermedadCie10/:id',canActivate: [enfermedadescie10guard], data: { expectedRol: ['admin', 'configuracion'] },
    component: EnfermedadCie10Component
  },
  {
    path: 'parametros',canActivate: [parametrosguard], data: { expectedRol: ['admin', 'configuraciones'] },
    component: ParametrosComponent
  },{
    path: 'parametro/:id',canActivate: [parametrosguard], data: { expectedRol: ['admin', 'configuracion'] },
    component: ParametroComponent
  },  
  {
    path: 'stocks',canActivate: [stockguard], data: { expectedRol: ['admin', 'stocks'] },
    component: StocksComponent
  },{
    path: 'stock/:id',canActivate: [stockguard], data: { expectedRol: ['admin', 'stock'] },
    component: StockComponent
  },
  {
    path: 'insumos',canActivate: [stockguard], data: { expectedRol: ['admin', 'stocks'] },
    component: InsumosComponent
  },{
    path: 'insumo/:id',canActivate: [stockguard], data: { expectedRol: ['admin', 'stocks'] },
    component: InsumoComponent
  },
  {
    path: 'medicamentos',canActivate: [stockguard], data: { expectedRol: ['admin', 'stocks'] },
    component: MedicamentosComponent
  },{
    path: 'medicamento/:id',canActivate: [stockguard], data: { expectedRol: ['admin', 'stocks'] },
    component: MedicamentoComponent
  },  
  {
    path: 'consultorio',canActivate: [consultorioguard], data: { expectedRol: ['admin', 'consultorio'] },
    component: ConsultorioComponent
  },
  {
    path: 'enfermeria',canActivate: [enfermeriaguard], data: { expectedRol: ['admin', 'enfermeria'] },
    component: EnfermeriaComponent
  },
  {
    path: 'reporteGeneral',canActivate: [reportesguard], data: { expectedRol: ['admin', 'reportes'] },
    component: ReportesComponent
  }
  ]
}];



@NgModule({
  imports: [
    RouterModule.forRoot( routes )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
