import React from 'react';
import { Checkbox, EyeInput, Card, CardSimple, CardWrapper } from 'Components';
class Home extends React.Component {
    constructor(props: any) {
        super(props)
    }
    render() {
        let cardObj = {
            imgUrl: 'http://storetest.veracity.com/ccstore/v1/images/?source=/file/v7962891920173970585/products/Shipdnv_productIcon.png',
            title: 'test',
            description: 'test des test destest destest destest destest destest destest destest des',
            catetory: 'all industry',
            userCount: 3,
            provider: 'http://storetest.veracity.com/ccstore/v1/images/?source=/file/v2302170816457600591/products/myDNVGLproviderLogo.png'
        }
        let cardWrapperObj = {
            cardTitle: 'SaaS',
            cardDescription: `
            Software as a service (SaaS) is a software distribute model in which a third-party provider hosts application and makes them
            available to customers over the Internet SaaS is one of three main categories of cloud computing, alongside infrastructure as
            a service (IaaS) and platform as a service (PaaS).
            `
        }

        return <main>
            <h1 className="page-title">Common component library</h1>
            <h2>Checkbox</h2>
            <Checkbox
                fieldName={"test"}
                isChecked={false}
                onChange={() => { }}
                isDisabled={false}
            />
            <br />
            <Checkbox
                fieldName={"test"}
                isChecked={true}
                onChange={() => { }}
                isDisabled={false}
            />
            <br />
            <Checkbox
                fieldName={"test2"}
                isChecked={false}
                onChange={() => { }}
                isDisabled={true}
            />
            <br />
            <Checkbox
                fieldName={"test2"}
                isChecked={true}
                onChange={() => { }}
                isDisabled={true}
            />

            <h2>Eye input</h2>
            <div style={{
                width: "400px"
            }}>
                <EyeInput />
            </div>

            <br />
            <h2>Simple Card</h2>

            <Card
                {...cardObj}
            />
            <br/>

            <h2>Card</h2>
            <CardSimple
                {...cardObj}
            />

            <h2>Card wrapper</h2>
            <div style={{width:"1000px"}}>
                            <CardWrapper
                            {
                                ...cardWrapperObj
                            }
                            >
                            
                            {[1,2,3,4,5,6,7,1,1,1,1,1,1,1,1].map(()=>{
                                        return <div className="item-wrapper"><Card 
                                            {...cardObj}
                                            /></div>
                                        })}
                                
                            
                            </CardWrapper>
            </div>
        </main>
    }
}

export default Home;