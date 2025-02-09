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
import { ServicoService } from '@/service/ServicoService';

const Servico = () => {

    let servicoVazio: TimeSync.Servico = {
        id: 0,
        nome: '',
        tempo: '',
        valor: '',
        usuarioId: 0,
        ativo: true
    };

    const [servicos, setServicos] = useState(null);
    const [servicoDialog, setServicoDialog] = useState(false);
    const [deleteServicoDialog, setDeleteServicoDialog] = useState(false);
    const [deleteServicosDialog, setDeleteServicosDialog] = useState(false);
    const [servico, setServico] = useState<TimeSync.Servico>(servicoVazio);
    const [selectedServicos, setSelectedServicos] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const servicoService = new ServicoService();

    const usuarios = [
        { label: 'Matheus Henrique', value: 2 },
    ];

    const onUsuarioChange = (e: DropdownChangeEvent) => {
        debugger
        let _servico = { ...servico };
        _servico.usuarioId = e.value;
        setServico(_servico);
    };

    const buscarTodos = () => {
        servicoService.buscarTodos()
            .then(response => setServicos(response.data))
            .catch(error => console.error(error))
    }

    useEffect(() => { buscarTodos() }, []);

    const openNew = () => {
        setServico(servicoVazio);
        setSubmitted(false);
        setServicoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServicoDialog(false);
    };

    const hideDeleteServicoDialog = () => {
        setDeleteServicoDialog(false);
    };

    const hideDeleteServicosDialog = () => {
        setDeleteServicosDialog(false);
    };

    const saveServico = () => {
        setSubmitted(true);
        servicoService.salvar(servico)
            .then(response => {
                setServicoDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Servico salvo com sucesso',
                    life: 3000
                })
                setServico(servicoVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao salvar serviço - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const editServico = (servico: TimeSync.Servico) => {
        setServico({ ...servico });
        setServicoDialog(true);
    };

    const confirmDeleteServico = (servico: TimeSync.Servico) => {
        setServico(servico);
        setDeleteServicoDialog(true);
    };

    const deleteServico = () => {
        const _servico = servico;
        _servico.ativo = false;
        setServico(_servico);

        servicoService.salvar(servico)
            .then(response => {
                setDeleteServicoDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Servico excluído com sucesso',
                    life: 3000
                })
                setServico(servicoVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao excluir serviço - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteServicosDialog(true);
    };

    const deleteSelectedServicos = () => {
        Promise.all(selectedServicos.map(async (_servico: TimeSync.Servico) => {
            _servico.ativo = false;
            await servicoService.salvar(_servico);
        })).then((response) => {
            buscarTodos()
            setSelectedServicos([])
            setDeleteServicosDialog(false)
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Serviços deletados',
                life: 3000
            })
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao deletar serviços',
                life: 3000
            });
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _servico = { ...servico };
        (_servico as any)[name] = val;
        setServico(_servico);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedServicos || !(selectedServicos as any).length} />
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

    const idBodyTemplate = (rowData: TimeSync.Servico) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const nomeBodyTemplate = (rowData: TimeSync.Servico) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.nome}
            </>
        );
    };

    const tempoBodyTemplate = (rowData: TimeSync.Servico) => {
        return (
            <>
                <span className="p-column-title">Tempo</span>
                {rowData.tempo}
            </>
        );
    };

    const valorBodyTemplate = (rowData: TimeSync.Servico) => {
        return (
            <>
                <span className="p-column-title">Valor</span>
                {rowData.valor}
            </>
        );
    };

    const actionBodyTemplate = (rowData: TimeSync.Servico) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editServico(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteServico(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Serviços</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const servicoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveServico} />
        </>
    );
    const deleteServicoDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteServicoDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteServico} />
        </>
    );
    const deleteServicosDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteServicosDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedServicos} />
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
                        value={servicos}
                        selection={selectedServicos}
                        onSelectionChange={(e) => setSelectedServicos(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Exibindo {first} até {last} de {totalRecords} Serviços"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum serviço encontrado"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Código" sortable body={idBodyTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tempo" header="Tempo" sortable body={tempoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="valor" header="Valor" sortable body={valorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={servicoDialog} style={{ width: '450px' }} header="Detalhes do Serviço" modal className="p-fluid" footer={servicoDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="nome">Nome</label>
                            <InputText
                                id="nome"
                                value={servico.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !servico.nome
                                })}
                            />
                            {submitted && !servico.nome && <small className="p-invalid">Nome é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="tempo">Tempo</label>
                            <InputText
                                id="tempo"
                                value={servico.tempo}
                                onChange={(e) => onInputChange(e, 'tempo')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !servico.tempo
                                })}
                            />
                            {submitted && !servico.tempo && <small className="p-invalid">Tempo é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="valor">Valor</label>
                            <InputText
                                id="valor"
                                value={servico.valor}
                                onChange={(e) => onInputChange(e, 'valor')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !servico.valor
                                })}
                            />
                            {submitted && !servico.valor && <small className="p-invalid">Valor é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="usuarioId">Usuário</label>
                            <Dropdown id="usuarioId" value={servico.usuarioId} onChange={onUsuarioChange} options={usuarios} required></Dropdown>
                            {submitted && !servico.usuarioId && <small className="p-invalid">Usuário é obrigatório.</small>}
                        </div>


                    </Dialog>

                    <Dialog visible={deleteServicoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteServicoDialogFooter} onHide={hideDeleteServicoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {servico && (
                                <span>
                                    Você realmente deseja excluir o serviço <b>{servico.nome}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteServicosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteServicosDialogFooter} onHide={hideDeleteServicosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {servico && <span>Você realmente deseja excluir os serviços selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Servico;