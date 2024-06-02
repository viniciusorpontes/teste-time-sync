'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimeSync } from '@/types';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { AgendamentoService } from '@/service/AgendamentoService';
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";

const Agendamento = () => {

    let usuarioVazio: TimeSync.Usuario = {
        id: 0,
        cpf: '',
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        tipo: '',
        ativo: true
    };

    let agendamentoVazio: TimeSync.Agendamento = {
        id: 0,
        dataChegada: '',
        dataSaida: '',
        servicos: [],
        cliente: usuarioVazio,
        consumidor: usuarioVazio,
        ativo: true
    };

    let agendamentoDTOVazio: TimeSync.AgendamentoDTO = {
        id: 0,
        dataChegada: '',
        idsServicos: [],
        clienteId: 0,
        consumidorId: 0,
        ativo: true
    };

    const agendamentoToDTO = (agendamento: TimeSync.Agendamento) => {
        const idsServicos = agendamento.servicos.map(servico => servico.id);

        const _agendamentoDTO: TimeSync.AgendamentoDTO = {
            id: agendamento.id,
            dataChegada: agendamento.dataChegada,
            idsServicos: idsServicos,
            clienteId: agendamento.cliente.id,
            consumidorId: agendamento.consumidor.id,
            ativo: agendamento.ativo
        };

        return _agendamentoDTO;
    }

    const [agendamentos, setAgendamentos] = useState(null);
    const [agendamentoDialog, setAgendamentoDialog] = useState(false);
    const [deleteAgendamentoDialog, setDeleteAgendamentoDialog] = useState(false);
    const [deleteAgendamentosDialog, setDeleteAgendamentosDialog] = useState(false);
    const [agendamento, setAgendamento] = useState<TimeSync.Agendamento>(agendamentoVazio);
    const [agendamentoDTO, setAgendamentoDTO] = useState<TimeSync.AgendamentoDTO>(agendamentoDTOVazio);
    const [selectedAgendamentos, setSelectedAgendamentos] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const agendamentoService = new AgendamentoService();

    interface Servico {
        id: string;
        nome: string;
    }

    const itemServicoTemplate = (option: Servico) => {
        return (
            <div className="flex align-items-center">
                <span className="ml-2">{option.nome}</span>
            </div>
        );
    };

    const servicos: Servico[] = [
        { id: "1", nome: "Cabelo" },
        { id: "2", nome: "Cabelo e Barba" }
    ];

    const onServicoChange = (e: MultiSelectChangeEvent) => {
        const ids = e.value.map((servico: Servico) => servico.id);
        let _agendamento = { ...agendamentoDTO };
        _agendamento.idsServicos = ids;
        setAgendamentoDTO(_agendamento);
    }

    const clientes = [
        { label: 'Matheus Henrique', value: 2 },
    ];

    const onClienteChange = (e: DropdownChangeEvent) => {
        let _agendamentoDTO = { ...agendamentoDTO };
        _agendamentoDTO.clienteId = e.value;
        setAgendamentoDTO(_agendamentoDTO);
    };

    const consumidores = [
        { label: 'Augusto', value: 3 },
    ];

    const onConsumidorChange = (e: DropdownChangeEvent) => {
        let _agendamentoDTO = { ...agendamentoDTO };
        _agendamentoDTO.consumidorId = e.value;
        setAgendamentoDTO(_agendamentoDTO);
    };

    const buscarTodos = () => {
        agendamentoService.buscarTodos()
            .then(response => setAgendamentos(response.data))
            .catch(error => console.error(error))
    }

    useEffect(() => { buscarTodos() }, []);

    const openNew = () => {
        setAgendamentoDTO(agendamentoDTOVazio);
        setSubmitted(false);
        setAgendamentoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAgendamentoDialog(false);
    };

    const hideDeleteAgendamentoDialog = () => {
        setDeleteAgendamentoDialog(false);
    };

    const hideDeleteAgendamentosDialog = () => {
        setDeleteAgendamentosDialog(false);
    };

    const saveAgendamento = () => {
        setSubmitted(true);
        agendamentoService.salvar(agendamentoDTO)
            .then(response => {
                setAgendamentoDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Agendamento salvo com sucesso',
                    life: 3000
                })
                setAgendamentoDTO(agendamentoDTOVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao salvar agendamento - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const editAgendamento = (agendamento: TimeSync.Agendamento) => {
        const _agendamentoDTO = agendamentoToDTO(agendamento);
        setAgendamentoDTO(_agendamentoDTO);
        setAgendamentoDialog(true);
    };

    const confirmDeleteAgendamento = (agendamento: TimeSync.Agendamento) => {
        const _agendamentoDTO = agendamentoToDTO(agendamento);
        setAgendamentoDTO(_agendamentoDTO);
        setDeleteAgendamentoDialog(true);
    };

    const deleteAgendamento = () => {
        const _agendamentoDTO = agendamentoDTO
        _agendamentoDTO.ativo = false;
        setAgendamentoDTO(_agendamentoDTO);

        agendamentoService.salvar(agendamentoDTO)
            .then(response => {
                setDeleteAgendamentoDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Agendamento excluído com sucesso',
                    life: 3000
                })
                setAgendamentoDTO(agendamentoDTOVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao excluir agendamento - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteAgendamentosDialog(true);
    };

    const deleteSelectedAgendamentos = () => {
        Promise.all(selectedAgendamentos.map(async (_agendamento: TimeSync.Agendamento) => {
            _agendamento.ativo = false;
            const _agendamentoDTO = agendamentoToDTO(_agendamento);
            await agendamentoService.salvar(_agendamentoDTO);
        })).then((response) => {
            buscarTodos()
            setSelectedAgendamentos([])
            setDeleteAgendamentosDialog(false)
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Agendamentos deletados',
                life: 3000
            })
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao deletar agendamentos',
                life: 3000
            });
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _agendamentoDTO = { ...agendamentoDTO };
        (_agendamentoDTO as any)[name] = val;
        setAgendamentoDTO(_agendamentoDTO);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedAgendamentos || !(selectedAgendamentos as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const dataChegadaBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <span className="p-column-title">Data Chegada</span>
                {rowData.dataChegada}
            </>
        );
    };

    const dataSaidaBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <span className="p-column-title">Data Saída</span>
                {rowData.dataSaida}
            </>
        );
    };

    const clienteBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <span className="p-column-title">Cliente</span>
                {rowData.cliente.nome}
            </>
        );
    };

    const consumidorBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <span className="p-column-title">Consumidor</span>
                {rowData.consumidor.nome}
            </>
        );
    };

    const actionBodyTemplate = (rowData: TimeSync.Agendamento) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editAgendamento(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteAgendamento(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Agendamentos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const agendamentoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveAgendamento} />
        </>
    );
    const deleteAgendamentoDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteAgendamentoDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteAgendamento} />
        </>
    );
    const deleteAgendamentosDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteAgendamentosDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedAgendamentos} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={agendamentos}
                        selection={selectedAgendamentos}
                        onSelectionChange={(e) => setSelectedAgendamentos(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Exibindo {first} até {last} de {totalRecords} agendamentos"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum agendamento encontrado"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Código" sortable body={idBodyTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="dataChegada" header="Data Chegada" sortable body={dataChegadaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="dataSaida" header="Data Saída" sortable body={dataSaidaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="cliente" header="Cliente" sortable body={clienteBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="consumidor" header="Consumidor" sortable body={consumidorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={agendamentoDialog} style={{ width: '450px' }} header="Detalhes do Serviço" modal className="p-fluid" footer={agendamentoDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="dataChegada">Data Chegada</label>
                            <InputText
                                id="dataChegada"
                                value={agendamentoDTO.dataChegada}
                                onChange={(e) => onInputChange(e, 'dataChegada')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !agendamentoDTO.dataChegada
                                })}
                            />
                            {submitted && !agendamentoDTO.dataChegada && <small className="p-invalid">Data chegada é obrigatória.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idsServicos">Serviços</label>
                            <MultiSelect
                                value={agendamentoDTO.idsServicos}
                                onChange={onServicoChange}
                                options={servicos}
                                itemTemplate={itemServicoTemplate}
                                placeholder="Selecione os serviços"
                                filter
                                className="multiselect-custom"
                                display="chip"
                                dataKey="id"
                            />
                            {submitted && !agendamentoDTO.idsServicos && <small className="p-invalid">Informar serviços é obrigatório.</small>}
                        </div>


                        <div className="field">
                            <label htmlFor="clienteId">Cliente</label>
                            <Dropdown id="clienteId" value={agendamentoDTO.clienteId} onChange={onClienteChange} options={clientes} required></Dropdown>
                            {submitted && !agendamentoDTO.clienteId && <small className="p-invalid">Usuário é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="consumidorId">Consumidor</label>
                            <Dropdown id="consumidorId" value={agendamentoDTO.consumidorId} onChange={onConsumidorChange} options={consumidores} required></Dropdown>
                            {submitted && !agendamentoDTO.consumidorId && <small className="p-invalid">Consumidor é obrigatório.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteAgendamentoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteAgendamentoDialogFooter} onHide={hideDeleteAgendamentoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {agendamentoDTO && (
                                <span>
                                    Você realmente deseja excluir o agendamento id <b>{agendamentoDTO.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAgendamentosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAgendamentosDialogFooter} onHide={hideDeleteAgendamentosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {agendamentoDTO && <span>Você realmente deseja excluir os agendamentos selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Agendamento;