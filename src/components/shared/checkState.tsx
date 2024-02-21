import { Button, Center, Group, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "../contexts/UserContext";
import { UserData } from "~/lib/repositories/userDataRepository";
export default function CheckState(props: { message: string, checkUserdata: boolean, children: React.ReactNode }) {
    const { state } = useAuthState();
    const [userData] = useState<UserData>();
    const [autorized, setAutorized] = useState<boolean>(false)
    useEffect(() => {
        console.log(state, userData);
        if (state.state === 'SIGNED_IN') {
            if (props.checkUserdata) {
                if (!userData) {
                    modals.open({
                        title: 'Complete seu cadastro',
                        centered: true,
                        children: (
                            <>
                                <Center>
                                    <Text size='lg'>{props.message}</Text>
                                </Center>
                                <Group justify='space-between'>
                                    <Button variant="default" component={Link} to='/profile' mt="md">
                                        Fazer isso depois
                                    </Button>
                                    <Button onClick={() => modals.closeAll()} mt="md">
                                        Ir para pagina de cadastro
                                    </Button>
                                </Group>
                            </>
                        ),
                    });
                }
            }
            setAutorized(true);
        } else {
            modals.open({
                title: 'Faça o login',
                centered: true,
                children: (
                    <>
                        <Center>
                            <Text size='lg'>Faça o login para acessar essa funcionalidade</Text>
                        </Center>
                        <Group justify='space-between'>
                            <Button variant="default" component={Link} to='/profile' mt="md">
                                Fazer isso depois
                            </Button>
                            <Button onClick={() => modals.closeAll()} mt="md">
                                Ir para pagina de cadastro
                            </Button>
                        </Group>
                    </>
                ),
            });
        }
    }, [])
    return autorized ? <>{props.children}</> : <></>    

}