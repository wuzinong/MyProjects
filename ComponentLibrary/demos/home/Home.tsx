import React from 'react';
import { Checkbox, EyeInput, Card, CardSimple, CardWrapper, Checkbox2,Video,ResponsiveImg,Avator,ResponsiveTable } from 'Components';
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

        let checkObj2 = {
            labelText: 'test label',
            name: 'SaaS',
            isChecked: true,
            checkboxChange: (name: string, newState: boolean, event: any) => {
                console.log(name);
                console.log(newState);
                console.log('-----')
                console.log(event);
            }
        }

        let imageUrl = "https://cdn.sanity.io/images/yk5gp8um/marketplace-dev/1b4ce41ba9368f3c0d9ac73f894338a1e2ac6c0f-6000x4000.jpg";
        let imgProps = {
            imgArr:[
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?fm=webp&w=340",
                    mediaQuery:"(max-width: 400px)",
                    imgType:"image/webp"
                },
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?fm=webp&w=440",
                    mediaQuery:"(max-width: 800px)",
                    imgType:"image/webp"
                },
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?fm=webp&w=540",
                    mediaQuery:"(max-width: 1200px)",
                    imgType:"image/webp"
                },
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?fm=webp",
                    mediaQuery:"",
                    imgType:"image/webp"
                },
                {
                    imgUrl:imageUrl,
                    imgQuery:"?w=340",
                    mediaQuery:"(max-width: 400px)"
                },
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?w=440",
                    mediaQuery:"(max-width: 800px)"
                },
                { 
                    imgUrl:imageUrl,
                    imgQuery:"?w=540",
                    mediaQuery:"(max-width: 1200px)"
                }
            ],
            defaultUrl:imageUrl,
            alt:'test alt'
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

            <h2>Checkbox2</h2>
            <Checkbox2
                {...checkObj2}
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
            <br />

            <h2>Card</h2>
            <CardSimple
                {...cardObj}
            />

            <h2>Card wrapper</h2>
            <div style={{ width: "1000px" }}>
                <CardWrapper
                    {
                    ...cardWrapperObj
                    }
                >

                    {[1, 2, 3, 4, 5, 6, 7, 1, 1, 1, 1, 1, 1, 1, 1].map(() => {
                        return <div className="item-wrapper"><Card
                            {...cardObj}
                        /></div>
                    })}


                </CardWrapper>
            </div>


            <h2>Video Iframe</h2>
            <Video videoUrl="https://production.presstogo.com/mars/embed?o=766116EDAD37954F&c=10651&a=N" />

            <h2>Video h5</h2>
            <Video useOrigin={true} videoUrl="https://www.w3schools.com/HTML/mov_bbb.mp4" />

            <h2>Responsive images</h2>
            <div style={{width:"1200px",height:"800px",overflow:"hidden"}}>
            <ResponsiveImg 
                        {...imgProps}
                    />
            </div>
            
            <h2>Responsive table</h2>
            <div style={{width:"600px",height:"200px",overflowY:"scroll"}}>
                <ResponsiveTable
                items = {
                    {
                        "head":["head1","head2","head3","head4"],
                        "body":[["col1_head1","col2_head1","col3_head1","col4_head1"],["head2_","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfa","sdfsdf","asdfasdfa","sdfsdf"]
                        ,["asdfasdfa","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfa","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfa","sdfsdf","asdfasdfa","sdfsdf"]
                        ,["asdfasdfa","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfaasdfasdfaasdfasdfa","sdfsdf","asdfasdfa","sdfsdf"]
                        ,["asdfasdfaasdfasdfaasdfasdfa","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfaasdfasdfaasdfasdfa","sdfsdf","asdfasdfa","sdfsdf"]
                        ,["asdfasdfaasdfasdfaasdfasdfa","sdfsdf","asdfasdfa","sdfsdf"],["asdfasdfaasdfasdfaasdfasdfa","sdfsdf","asdfasdfa","sdfsdf"]]
                    }
                }
                />
            </div>
            <h2>Avator</h2>
            <Avator/>
            
        </main>
    }
}

export default Home;