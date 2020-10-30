import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { PersonaComponent } from 'src/app/vistas/formularios/persona/persona.component';
import { PersonasComponent } from 'src/app/vistas/listas/personas/personas.component';
import { PacienteComponent } from 'src/app/vistas/formularios/paciente/paciente.component';
import { PacientesComponent } from 'src/app/vistas/listas/pacientes/pacientes.component';
import { FuncionarioComponent } from 'src/app/vistas/formularios/funcionario/funcionario.component';
import { FuncionariosComponent } from 'src/app/vistas/listas/funcionarios/funcionarios.component';
import { ParametroComponent } from 'src/app/vistas/formularios/parametro/parametro.component';
import { ParametrosComponent } from 'src/app/vistas/listas/parametros/parametros.component';
import { ProcedimientosComponent } from 'src/app/vistas/listas/procedimientos/procedimientos.component';
import { ProcedimientoComponent } from 'src/app/vistas/formularios/procedimiento/procedimiento.component';
import { UsuarioComponent } from 'src/app/vistas/formularios/usuario/usuario.component';
import { UsuariosComponent } from 'src/app/vistas/listas/usuarios/usuarios.component';
import { AreaComponent } from 'src/app/vistas/formularios/area/area.component';
import { AreasComponent } from 'src/app/vistas/listas/areas/areas.component';
import { CarrerasComponent } from 'src/app/vistas/listas/carreras/carreras.component';
import { CarreraComponent } from 'src/app/vistas/formularios/carrera/carrera.component';
import { DepartamentosComponent } from 'src/app/vistas/listas/departamentos/departamentos.component';
import { DepartamentoComponent } from 'src/app/vistas/formularios/departamento/departamento.component';
import { DependenciasComponent } from 'src/app/vistas/listas/dependencias/dependencias.component';
import { DependenciaComponent } from 'src/app/vistas/formularios/dependencia/dependencia.component';
import { EstamentosComponent } from 'src/app/vistas/listas/estamentos/estamentos.component';
import { EstamentoComponent } from 'src/app/vistas/formularios/estamento/estamento.component';
import { CitasComponent } from 'src/app/vistas/listas/citas/citas.component';
import { CitaComponent } from 'src/app/vistas/formularios/cita/cita.component';
import { HorariosComponent } from 'src/app/vistas/listas/horarios/horarios.component';
import { HorarioComponent } from 'src/app/vistas/formularios/horario/horario.component';
import { StocksComponent } from 'src/app/vistas/listas/stocks/stocks.component';
import { StockComponent } from 'src/app/vistas/formularios/stock/stock.component';
import { InsumosComponent } from 'src/app/vistas/listas/insumos/insumos.component';
import { InsumoComponent } from 'src/app/vistas/formularios/insumo/insumo.component';
import { HistorialesClinicosComponent } from 'src/app/vistas/listas/historialesClinicos/historialesClinicos.component';
import { HistorialClinicoComponent } from 'src/app/vistas/formularios/historialClinico/historialClinico.component';
import { ConsultorioComponent } from 'src/app/vistas/formularios/consultorio/consultorio.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatDividerModule} from '@angular/material/divider';
import { SharedModule } from 'src/app/general/shared.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from 'src/app/vistas/dashboard.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  declarations: [
    DefaultComponent,
    PersonasComponent,
    PersonaComponent,
    PacientesComponent,
    PacienteComponent,
    FuncionariosComponent,
    FuncionarioComponent,
    ParametrosComponent,
    ParametroComponent,
    ProcedimientosComponent,
    ProcedimientoComponent,
    UsuariosComponent,
    UsuarioComponent,
    AreasComponent,
    AreaComponent,
    CarrerasComponent,
    CarreraComponent,
    DepartamentosComponent,
    DepartamentoComponent,
    DependenciasComponent,
    DependenciaComponent,
    EstamentosComponent,
    EstamentoComponent,
    CitasComponent,
    CitaComponent,
    HorariosComponent,
    HorarioComponent,
    StocksComponent,
    StockComponent,
    InsumosComponent,
    InsumoComponent,
    HistorialesClinicosComponent,
    HistorialClinicoComponent,
    ConsultorioComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MatSidenavModule,
    MatDividerModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    DataTablesModule,
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule
  ],
  providers: [
    DashboardService
  ]
})
export class DefaultModule { }
