import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/usuarios"
})

export class UsuarioService {

    buscarTodos() {
        return axiosInstance.get('/buscarTodos')
    }

    salvar(usuario: TimeSync.Usuario) {
        return axiosInstance.post('', usuario)
    }

}