type TipoUsuario = '' | 'ADMINISTRADOR' | 'CLIENTE' | 'CONSUMIDOR';

declare namespace TimeSync {
    type Usuario = {
        id: number;
        cpf: string;
        nome: string;
        email: string;
        telefone: string;
        senha: string;
        tipo: TipoUsuario;
        ativo: boolean;
    };

    type Servico = {
        id: number;
        nome: string;
        tempo: string;
        valor: string;
        usuarioId: number;
        ativo: boolean;
    }

    type Agendamento = {
        id: number;
        dataChegada: string;
        dataSaida: string;
        servicos: Servico[];
        cliente: Usuario;
        consumidor: Usuario;
        ativo: boolean;
    }

    type AgendamentoDTO = {
        id: number;
        dataChegada: string;
        idsServicos: number[];
        clienteId: number;
        consumidorId: number
        ativo: boolean;
    }
}